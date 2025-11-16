// Nomini v0.2.0
// Inspired by aidenybai/dababy
// Copyright (c) 2025 nonnorm
// Licensed under the MIT License.

(() => {
    "use strict";
    const helpers = {
        _nmFetching: false,
        $get(url, data) {
            this.$fetch(url, "GET", data);
        },
        $post(url, data) {
            this.$fetch(url, "POST", data);
        },
        $fetch(url, method, data) {
            const el = currentEl;

            this._nmFetching = true;

            const opts = { headers: { "nm-request": true }, method };

            data = { ...this.$nmData(), ...this.$dataset(), ...data };

            const encodedData = new URLSearchParams(data);

            if (/GET|DELETE/.test(method))
                url += (url.includes("?") ? "&" : "?") + encodedData;
            else opts.body = encodedData;

            fetch(url, opts)
                .then(async res => {
                    const text = await res.text();
                    if (!res.ok) {
                        throw new Error(`${res.statusText}: ${text}`)
                    }
                    return text;
                })
                .then(swap)
                .catch(err => dispatch(el, "error", { err, url }))
                .finally(() => this._nmFetching = false);
        },
        $debounce(fn, ms) {
            clearTimeout(currentEl.nmTimer);
            currentEl.nmTimer = setTimeout(fn, ms);
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
        let elMatch = el.matches(selector) ? [el] : [];
        return [...elMatch, ...el.querySelectorAll(selector)];
    };

    const getClosestProxy = (el) => el.closest("[nm-data]")?.nmProxy || {};

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
                    if (prop in trackedDeps && currentBind) {
                        trackedDeps[prop].add(currentBind);
                    }

                    return obj[prop];
                },
                set(obj, prop, val) {
                    obj[prop] = val;

                    if (!(prop in trackedDeps))
                        trackedDeps[prop] = new Set();

                    // Required to prevent infinite loops (this took 3 hours to debug!)
                    let thisBind = currentBind;
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

            proxyData[refName] = el;
        });

        queryAttr(baseEl, "[nm-form]").forEach(el => {
            const proxyData = getClosestProxy(el);

            el.querySelectorAll("[name]").forEach(inputEl => {
                const name = inputEl.name;

                const setVal = () => {
                    if (inputEl.type === "checkbox")
                        proxyData[name] = inputEl.checked;
                    else if (inputEl.type === "radio" && inputEl.checked)
                        proxyData[name] = inputEl.value;
                    else if (inputEl.type === "file")
                        proxyData[name] = inputEl.files;
                    else proxyData[name] = inputEl.value;
                };

                setVal();

                inputEl.addEventListener("input", setVal);
                inputEl.addEventListener("change", setVal);
            })

            el.querySelectorAll("button, input[type='submit']").forEach(submitEl => {
                runTracked(() => submitEl.disabled = proxyData._nmFetching);
            })
        });

        processBindings(baseEl, "nm-bind", (bindEl, key, val) => {
            runTracked(async () => {
                bindEl[key] = await val();
            });
        });

        processBindings(baseEl, "nm-on", (onEl, key, val) => {
            onEl.addEventListener(key, (e) => {
                e.preventDefault();
                currentEl = onEl;
                val(e);
                currentEl = null;
            });
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
