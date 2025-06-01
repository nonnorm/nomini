// Inspired by aidenybai/dababy
(() => {
    const evalExpression = (expression = "{}", data = {}, thisArg = window) => {
        return new Function("__data", `with(__data) { return ${expression} }`).call(thisArg, data);
    };

    const init = (baseEl = document) => {
        baseEl.querySelectorAll("[data]").forEach((dataEl) => {
            const rawData = evalExpression(dataEl.getAttribute("data") || undefined);

            const renderBinds = () => {
                const binds = dataEl.matches("[bind]")
                    ? [dataEl, ...dataEl.querySelectorAll("[bind]")]
                    : [...dataEl.querySelectorAll("[bind]")];
                binds
                    .filter((bindEl) => bindEl.closest("[data]") == dataEl)
                    .forEach((bindEl) => {
                        const props = evalExpression(
                            bindEl.getAttribute("bind") || undefined,
                            proxyData,
                            bindEl
                        );
                        Object.entries(props).forEach(
                            async ([key, value]) => (bindEl[key] = await value)
                        );
                    });
            };

            const proxyData = new Proxy(rawData, {
                set(obj, prop, val) {
                    obj[prop] = val;
                    renderBinds();
                    return true;
                },
            });

            renderBinds();
        });
    };

    document.addEventListener("DOMContentLoaded", () => init());
    document.addEventListener("nomini:process", (e) => init(e.target));
})();
