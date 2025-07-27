"use strict";
// Inspired by aidenybai/dababy
(() => {
    const helpers = {
        nmFetching: false,
        nmError: null,
        nmInternal: {
            nmTimer: null
        },
        get(url, data) {
            this.nmFetching = true;

            if (data)
                url += (url.includes("?") ? "&" : "?") + new URLSearchParams(data);

            fetch(url, { headers: { "nm-request": true } })
                .then(res => res.text())
                .then(swap)
                .catch(err => this.nmError = err)
                .finally(() => this.nmFetching = false);
        },
        post(url, data) {
            this.nmFetching = true;

            fetch(url, { headers: { "nm-request": true }, method: "POST", body: new URLSearchParams(data) })
                .then(res => res.text())
                .then(swap)
                .catch(err => this.nmError = err)
                .finally(() => this.nmFetching = false);
        },
        debounce(fn, ms) {
            const internal = this.nmInternal;

            clearTimeout(internal.nmTimer);
            internal.nmTimer = setTimeout(fn, ms);
        }
    };

    let currentBind = null;

    const swap = (text) => {
        const fragments = new DOMParser().parseFromString(text, "text/html").body.children;

        for (const fragment of fragments) {
            const strategy = fragment.getAttribute("nm-swap") || "outerHTML";
            const target = document.getElementById(fragment.id);

            if (strategy === "innerHTML")
                target.replaceChildren(fragment);
            else if (strategy === "outerHTML")
                target.replaceWith(fragment);
            else if (/(before|after)(begin|end)/.test(strategy))
                target.insertAdjacentElement(strategy, fragment);
            else throw strategy;

            fragment.dispatchEvent(new CustomEvent("nm:process", { bubbles: true }));
        }
    };

    const evalExpression = (expression, data, thisArg) => {
        try {
            return new Function(
                "nmData", `with(nmData) { return {${expression}} }`,
            ).call(thisArg, data);
        } catch (err) {
            console.error(err, expression);
            return {};
        }
    };

    const queryAttr = (el, selector) => {
        return el.matches(selector)
            ? [el, ...el.querySelectorAll(selector)]
            : [...el.querySelectorAll(selector)];
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

        queryAttr(baseEl, "[nm-bind]")
            .forEach((bindEl) => {
                const proxyData = bindEl.closest("[nm-data]")?.nmProxy || {};

                const props = evalExpression(
                    bindEl.getAttribute("nm-bind"),
                    proxyData,
                    bindEl,
                );

                Object.entries(props).forEach(([key, val]) => {
                    if (key.startsWith("on")) {
                        bindEl[key] = val;
                    } else {
                        currentBind = async () => {
                            bindEl[key] = await val();
                        };
                        currentBind();
                        currentBind = null;
                    }
                });
            });
    };

    document.addEventListener("DOMContentLoaded", () => init(document.body));
    document.addEventListener("nm:process", (e) => init(e.target));
})();
