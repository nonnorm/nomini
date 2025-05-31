// Inspired by aidenybai/dababy
(() => {
    const evalExpression = (expression = "{}", data = {}, thisArg = window) => {
        return new Function("data", `return ${expression}`).call(thisArg, data);
    };

    const init = (baseEl = document) => {
        baseEl.querySelectorAll("[data]").forEach((dataEl) => {
            const rawData = evalExpression(dataEl.getAttribute("data") || undefined);

            const renderBinds = () => {
                dataEl.querySelectorAll(":not([data]) [bind]").forEach((bindEl) => {
                    const props = evalExpression(bindEl.getAttribute("bind") || undefined, proxyData, bindEl);
                    Object.entries(props).forEach(([key, value]) => bindEl[key] = value);
                });
            };

            const proxyData = new Proxy(rawData, {
                set(obj, prop, val) {
                    obj[prop] = val;
                    renderBinds();
                    return true;
                }
            });

            renderBinds();
        });
    }

    document.addEventListener("DOMContentLoaded", () => init());
    document.addEventListener("dababy:process", (e) => init(e.target));
})()
