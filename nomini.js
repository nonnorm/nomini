// Nomini v0.2.0
// Inspired by aidenybai/dababy
// Copyright (c) 2025 nonnorm
// Licensed under the MIT License.

(() => {
    "use strict";
    const helpers = {
        _nmFetching: false,
        _nmAbort: null,
        $refs: {},
        $get(url, data) {
            this.$fetch(url, "GET", data);
        },
        $post(url, data) {
            this.$fetch(url, "POST", data);
        },
        $fetch(url, method, data) {
            const el = currentEl;

            if (this._nmAbort) this._nmAbort.abort();
            this._nmAbort = new AbortController();
            this._nmFetching = true;

            const opts = { headers: { "nm-request": true }, method, signal: this._nmAbort.signal };

            data = { ...this.$nmData(), ...this.$dataset(), ...data };

            const encodedData = new URLSearchParams(data);

            if (/GET|DELETE/.test(method))
                url += (url.includes("?") ? "&" : "?") + encodedData;
            else opts.body = encodedData;

            fetch(url, opts)
                .then(async res => {
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`${res.statusText}: ${errorText}`)
                    }

                    const decoder = new TextDecoder();

                    for await (const chunk of res.body) {
                        const buf = decoder.decode(chunk, { stream: true });
                        swap(buf);
                    }
                })
                .catch(err => dispatch(el, "error", { err, url }))
                .finally(() => this._nmFetching = false);
        },
        $nmData() {
            const isPrimitive = (x) => /string|number|boolean/.test(typeof x);

            return Object.fromEntries(
                Object.entries(this)
                    .filter(([k]) => /^[a-z]+$/i.test(k))
                    .map(([k, v]) => typeof v === "function" ? [k, v()] : [k, v])
                    .filter(([_, v]) => isPrimitive(v) || (Array.isArray(v) && v.every(isPrimitive)))
            );
        },
        $dataset() {
            let datasets = {};
            let el = currentEl;

            while (el) {
                datasets = { ...datasets, ...el.dataset }
                if (el.hasAttribute("nm-data")) break;
                el = el.parentElement;
            }

            return datasets;
        }
    };

    let currentBind = null;
    let currentEl = null;

    const dispatch = (el, name, detail, bubbles = true) => {
        el.dispatchEvent(new CustomEvent(`nm${name}`, { detail, bubbles }))
    };

    const swap = (text) => {
        const fragments = new DOMParser().parseFromString(text, "text/html").body.children;

        for (const fragment of fragments) {
            const strategy = fragment.getAttribute("nm-swap") || "outerHTML";
            const target = document.getElementById(fragment.id);

            if (strategy === "innerHTML") {
                fragment.id = null;
                target.replaceChildren(fragment);
            }
            else if (strategy === "outerHTML")
                target.replaceWith(fragment);
            else if (/(before|after)(begin|end)/.test(strategy))
                target.insertAdjacentElement(strategy, fragment);
            else throw strategy;

            init(fragment);
        }
    };

    const evalExpression = (expression, data, thisArg) => {
        if (expression.startsWith("{") && expression.endsWith("}")) {
            expression = expression.slice(1, -1);
        }

        try {
            return new Function(
                "__data", `with(__data) {return {${expression}}}`,
            ).call(thisArg, data);
        } catch (err) {
            console.error(err, expression);
            return {};
        }
    };

    const queryAttr = (el, selector) => {
        const elMatch = el.matches(selector) ? [el] : [];
        return [...elMatch, ...el.querySelectorAll(selector)];
    };

    const getClosestProxy = (el) => el.closest("[nm-data]")?.nmProxy || { ...helpers };

    const processBindings = (baseEl, attr, handlerFn) => {
        queryAttr(baseEl, `[${attr}]`).forEach(el => {
            const proxyData = getClosestProxy(el);

            const props = evalExpression(
                el.getAttribute(attr),
                proxyData,
                el,
            );

            Object.entries(props).forEach(([key, val]) => handlerFn(el, key, val));

            dispatch(el, "init", {}, false);
        })
    };

    const runTracked = (fn) => {
        currentBind = fn;
        currentBind();
        currentBind = null;
    }

    const init = (baseEl) => {
        queryAttr(baseEl, "[nm-use]").forEach((useEl) => {
            const template = document.getElementById(useEl.getAttribute("nm-use"));
            if (template) {
                const content = useEl.innerHTML;
                useEl.innerHTML = template.innerHTML;
                const slot = useEl.querySelector("slot:not([name])");
                if (slot) slot.outerHTML = content;
            }
        });

        queryAttr(baseEl, "[nm-data]").forEach((dataEl) => {
            const rawData = {
                ...evalExpression(
                    dataEl.getAttribute("nm-data"),
                    {},
                    dataEl,
                ),
                ...helpers
            };

            const trackedDeps = Object.fromEntries(Object.keys(rawData).map(k => [k, new Set()]));

            const proxyData = new Proxy(rawData, {
                get(obj, prop) {
                    if (prop in trackedDeps && currentBind)
                        trackedDeps[prop].add(currentBind);

                    return obj[prop];
                },
                set(obj, prop, val) {
                    obj[prop] = val;

                    if (!(prop in trackedDeps))
                        trackedDeps[prop] = new Set();

                    // Required to prevent infinite loops (this took 3 hours to debug!)
                    const thisBind = currentBind;
                    currentBind = null;

                    trackedDeps[prop].forEach(fn => fn());

                    currentBind = thisBind;

                    return true;
                },
            });

            dataEl.nmProxy = proxyData;
        });

        queryAttr(baseEl, "[nm-ref]").forEach(el => {
            const proxyData = getClosestProxy(el);
            const refName = el.getAttribute("nm-ref");

            proxyData.$refs[refName] = el;
        });

        queryAttr(baseEl, "[nm-form]").forEach(el => {
            const proxyData = getClosestProxy(el);

            queryAttr(el, "[name]").forEach(inputEl => {
                const name = inputEl.name;

                const setVal = () => {
                    if (inputEl.type === "checkbox")
                        proxyData[name] = inputEl.checked;
                    else if (inputEl.type === "radio" && inputEl.checked)
                        proxyData[name] = inputEl.value;
                    else if (inputEl.type === "file")
                        proxyData[name] = inputEl.files;
                    else if (/number|range/.test(inputEl.type))
                        proxyData[name] = +inputEl.value;
                    else proxyData[name] = inputEl.value;
                };

                setVal();

                inputEl.addEventListener("input", setVal);
                inputEl.addEventListener("change", setVal);
            });


            queryAttr(el, "button, input[type='submit']").forEach(submitEl => {
                runTracked(() => submitEl.disabled = proxyData._nmFetching);
            });
        });

        processBindings(baseEl, "nm-bind", (bindEl, key, val) => {
            currentEl = bindEl;
            runTracked(async () => {
                bindEl[key] = await val();
            });
            currentEl = null;
        });

        processBindings(baseEl, "nm-on", (onEl, key, val) => {
            const [eventName, ...mods] = key.split(".");

            const debounceMod = mods.find((val) => val.startsWith("debounce"));
            const delay = +(debounceMod?.slice(8));

            const listener = (e) => {
                const wrappedFn = () => {
                    currentEl = onEl;
                    val(e);
                    currentEl = null;
                }

                if (mods.includes("prevent")) e.preventDefault();
                if (mods.includes("stop")) e.stopPropagation();

                if (delay) {
                    clearTimeout(onEl.nmTimer);
                    onEl.nmTimer = setTimeout(wrappedFn, delay);
                } else wrappedFn();

                if (mods.includes("once")) onEl.removeEventListener(eventName, listener);
            };

            onEl.addEventListener(eventName, listener);
        });

        processBindings(baseEl, "nm-class", (classEl, key, val) => {
            const classList = classEl.classList;
            runTracked(() => {
                val() ? classList.add(key) : classList.remove(key);
            });
        });
    };

    document.addEventListener("DOMContentLoaded", () => init(document.body));
})();
