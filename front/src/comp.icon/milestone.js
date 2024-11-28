import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none", "stroke-width": 0.8 }, [
                h("path", { d: "M 5 1.5 L 2.7 5 L 5 8.5 L 7.3 5 L 5 1.5 Z" }),
                h("path", { "fill": "var(--color-fore)", "stroke-width": 0, d: "M 5 1.7 L 5 8.3 L 7.2 5 L 5 1.7 Z" })
                // h("path", { d: "M 2.4 8.2 L 2.4 1.2 M 2.4 1.8 L 8.1 1.8 L 6.7 3.8 L 8.2 5.9 L 2.4 5.9" }),
            ])
        ])
    }
}
