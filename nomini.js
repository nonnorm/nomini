// Nomini v0.3.1
// Inspired by aidenybai/dababy
// Copyright (c) 2025 nonnorm
// Licensed under the MIT License.

(() => {
    // Utility functions
    const dispatch = (el, name, opts) => {
        opts = { bubbles: true, detail: {}, ...opts };
        el.dispatchEvent(new CustomEvent(name, opts));
    };

    const evalExpression = (expression, data, thisArg) => {
        if (/^{.*}$/s.test(expression)) {
            expression = expression.slice(1, -1);
        }

        try {
            return new Function(
                "__data",
                `with(__data) {return {${expression}}}`,
            ).call(thisArg, data);
        } catch (err) {
            console.error("[Nomini] failed to parse obj:", expression, "\n", err);
            return {};
        }
    };

    const queryAttr = (el, selector) => {
        const elMatch = el.matches(selector) ? [el] : [];
        return [...elMatch, ...el.querySelectorAll(selector)].filter(
            (val) => !val.closest("[nm-ignore]"),
        );
    };

    const getClosestProxy = (el) =>
        el.closest("[nm-data]")?.nmProxy || helpers();

    const runTracked = (fn) => {
        currentBind = fn;
        currentBind();
        currentBind = null;
    };

    const runWithEl = (el, fn) => {
        currentEl = el;
        fn();
        currentEl = null;
    };

    // Important reactivity stuff
    let currentBind = null;
    let currentEl = null;

    // Helpers that are included with every data object
    const helpers = () => ({
        // --- BEGIN ref
        $refs: {},
        // --- END ref
        // --- BEGIN fetch
        _nmFetching: false,
        _nmAbort: new AbortController(),
        $get(url, data) {
            this.$fetch(url, "GET", data);
        },
        $post(url, data) {
            this.$fetch(url, "POST", data);
        },
        $fetch(url, method, data) {
            const el = currentEl;

            this._nmAbort.abort();
            this._nmAbort = new AbortController();
            this._nmFetching = true;

            const opts = {
                headers: { "nm-request": true },
                method,
                signal: this._nmAbort.signal,
            };

            data = { ...this.$nmData(), ...this.$dataset(), ...data };

            const encodedData = new URLSearchParams(data);

            if (/GET|DELETE/.test(method))
                url += (url.includes("?") ? "&" : "?") + encodedData;
            else opts.body = encodedData;

            fetch(url, opts)
                .then(async (res) => {
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`${res.statusText}: ${errorText}`);
                    }

                    const decoder = new TextDecoder();

                    for await (const chunk of res.body) {
                        const buf = decoder.decode(chunk);
                        swap(buf);
                    }
                })
                .catch((err) => dispatch(el, "fetcherr", { detail: { err, url } }))
                .finally(() => this._nmFetching = false);
        },
        $nmData() {
            const isPrimitive = (x) => x !== Object(x);

            return Object.entries(this).reduce((acc, [k, v]) => {
                if (!/^[a-z]+$/i.test(k)) return acc;
                if (typeof v === "function") v = v();
                if (isPrimitive(v) || (Array.isArray(v) && v.every(isPrimitive)))
                    acc[k] = v;
                return acc;
            }, {});
        },
        // --- END fetch
        $dataset() {
            let datasets = {};
            let el = currentEl;

            while (el) {
                datasets = { ...el.dataset, ...datasets };
                if (el.hasAttribute("nm-data")) break;
                el = el.parentElement;
            }

            return datasets;
        },
        $watch: runTracked,
        $dispatch(evt, detail, opts) {
            dispatch(currentEl, evt, { detail, ...opts });
        },
        $debounce(fn, ms, abortable = true) {
            const el = currentEl;
            const signal = this._nmAbort.signal;
            clearTimeout(el.nmTimer);
            el.nmTimer = setTimeout(() => {
                if (!(abortable && signal.aborted)) runWithEl(el, fn)
            }, ms);
        },
        // --- BEGIN helpers
        $persist(prop, key) {
            key = key || `_nmProp-${prop}`;

            const stored = localStorage[key];
            if (stored) this[prop] = JSON.parse(stored);

            runTracked(() => {
                localStorage[key] = JSON.stringify(this[prop]);
            });
        },
        // --- END helpers
    });

    // --- BEGIN fetch
    const swap = (text) => {
        const template = document.createElement("template");
        template.innerHTML = text;

        for (const fragment of template.content.children) {
            if (!fragment.id) {
                console.warn("[Nomini] Fragment is missing an id: ", fragment);
                continue;
            }

            const strategy = fragment.getAttribute("nm-swap") || "outer";
            const target = document.getElementById(fragment.id);

            if (!target) {
                console.warn("[Nomini] Swap target not found: #", fragment.id);
                continue;
            }

            queryAttr(target, "[nm-bind]").forEach(
                (el) => dispatch(el, "destroy", { bubbles: false })
            );

            // --- BEGIN morph
            cssMorph(fragment);
            // --- END morph

            if (strategy === "inner") {
                target.replaceChildren(...fragment.childNodes);
                init(target);
            } else if (strategy === "outer") {
                target.replaceWith(fragment);
                init(fragment);
            } else if (/(before|after|prepend|append)/.test(strategy)) {
                const kids = [...fragment.childNodes];
                target[strategy](...kids);
                kids.forEach((n) => n.nodeType === 1 && init(n));
            } else console.error("[Nomini] Invalid swap strategy: ", strategy);
        }
    };
    // --- END fetch

    // --- BEGIN morph
    const cssMorph = (fragment) => {
        const attributesToSettle = ["style", "class", "height", "width"];

        const idSet = queryAttr(fragment, "[id]");

        idSet.forEach((newEl) => {
            const oldEl = document.getElementById(newEl.id);

            if (oldEl && oldEl.tagName === newEl.tagName) {
                const newElCopy = newEl.cloneNode();

                const morph = (src) =>
                    attributesToSettle.forEach((attr) => {
                        const attrVal = src.getAttribute(attr);
                        if (attrVal) newEl.setAttribute(attr, attrVal);
                        else newEl.removeAttribute(attr);
                    });

                morph(oldEl);
                requestAnimationFrame(() => morph(newElCopy));
            }
        });
    };
    // --- END morph

    const init = (baseEl) => {
        // --- BEGIN template
        queryAttr(baseEl, "[nm-use]").forEach((useEl) => {
            const id = useEl.getAttribute("nm-use");
            const template = document.getElementById(id);
            if (template) {
                const templateFrag = template.content.cloneNode(true);
                const slot = templateFrag.querySelector("slot:not([name])");
                if (slot) slot.replaceWith(...useEl.childNodes);
                useEl.replaceChildren(templateFrag);
            } else console.error("[Nomini] No template with id: #", id);
        });
        // --- END template

        // --- BEGIN data
        queryAttr(baseEl, "[nm-data]").forEach((dataEl) => {
            const rawData = {
                ...evalExpression(dataEl.getAttribute("nm-data"), {}, dataEl),
                ...helpers(),
            };

            const trackedDeps = {};

            const proxyData = new Proxy(rawData, {
                get(obj, prop) {
                    if (currentBind) (trackedDeps[prop] ||= new Set()).add(currentBind);

                    return obj[prop];
                },
                set(obj, prop, val) {
                    obj[prop] = val;

                    const deps = trackedDeps[prop];

                    if (deps) {
                        // Required to prevent infinite loops (this took 3 hours to debug!)
                        const thisBind = currentBind;
                        currentBind = null;

                        deps.forEach((fn) => fn());

                        currentBind = thisBind;
                    }

                    return true;
                },
            });

            dataEl.nmProxy = proxyData;
        });
        // --- END data

        // --- BEGIN ref
        queryAttr(baseEl, "[nm-ref]").forEach((el) => {
            const proxyData = getClosestProxy(el);
            const refName = el.getAttribute("nm-ref");

            proxyData.$refs[refName] = el;
        });
        // --- END ref

        // --- BEGIN form
        queryAttr(baseEl, "[nm-form]").forEach((el) => {
            const proxyData = getClosestProxy(el);

            queryAttr(el, "[name]").forEach((inputEl) => {
                const inputType = inputEl.type;

                const setVal = () => {
                    let res;

                    if (inputType === "checkbox")
                        res = inputEl.checked;
                    else if (inputType === "radio" && inputEl.checked)
                        res = inputEl.value;
                    else if (inputType === "file")
                        res = inputEl.files;
                    else if (/number|range/.test(inputType))
                        res = +inputEl.value;
                    else res = inputEl.value;

                    proxyData[inputEl.name] = res;
                };

                setVal();

                inputEl.addEventListener("input", setVal);
                inputEl.addEventListener("change", setVal);
            });

            queryAttr(el, "button, input[type='submit']").forEach((submitEl) => {
                runTracked(() => submitEl.disabled = proxyData._nmFetching);
            });
        });
        // --- END form

        // --- BEGIN bind
        queryAttr(baseEl, "[nm-bind]").forEach((bindEl) => {
            const proxyData = getClosestProxy(bindEl);

            const props = evalExpression(
                bindEl.getAttribute("nm-bind"),
                proxyData,
                bindEl,
            );

            Object.entries(props).forEach(([key, val]) => {
                if (key.startsWith("on")) {
                    const [eventName, ...mods] = key.slice(2).split(".");

                    // --- BEGIN evtmods
                    const debounceMod = mods.find((val) => val.startsWith("debounce"));
                    const delay = +debounceMod?.slice(8);
                    // --- END evtmods

                    const listener = (e) => runWithEl(bindEl, () => {
                        // --- BEGIN evtmods

                        if (mods.includes("prevent")) e.preventDefault();
                        if (mods.includes("stop")) e.stopPropagation();

                        if (delay) proxyData.$debounce(() => val(e), delay);
                        else
                            // --- END evtmods
                            val(e);
                    });

                    // I'm not getting rid of these modifiers, it's so short that it probably won't matter
                    (mods.includes("window") ? window : bindEl).addEventListener(eventName, listener, {
                        once: mods.includes("once"),
                    });
                } else {
                    const [main, sub] = key.split(".");
                    runWithEl(bindEl,
                        () => runTracked(async () => {
                            const resolvedVal = await val();

                            if (sub) {
                                if (main === "class") bindEl.classList.toggle(sub, resolvedVal);
                                else bindEl[main][sub] = resolvedVal;
                            } else bindEl[main] = resolvedVal;
                        })
                    );
                }
            });

            dispatch(bindEl, "init", { bubbles: false });
        });
        // --- END bind
    };

    document.addEventListener("DOMContentLoaded", () => init(document.body));
})();
