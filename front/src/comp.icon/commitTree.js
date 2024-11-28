import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none" }, [
                h("path", { "stroke-width": 0.8, d: "M 3.3 8 L 3.3 2 M 3.3 7.2 L 3.3 6.3 C 3.3 5.0 7.1 5.7 7.1 4.5 L 7.1 2" }),
            ]),
            h("g", { "stroke": "none", "fill": "var(--color-fore)" }, [
                h("circle", { cx: 3.3, cy: 1.9, r: 1.1 }),
                h("circle", { cx: 7.2, cy: 1.9, r: 1.1 }),
                h("circle", { cx: 3.3, cy: 8.1, r: 1 }),
            ])
        ])
    }
}
