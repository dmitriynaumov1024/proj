import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "fill": "none", "stroke": "var(--color-fore)", "stroke-width": "0.8", transform: "translate(0.8, -0.4)" }, [
                h("circle", { cx: 5, cy: 2.5, r: 2.2 }),
                h("path", { d: "M 1 9 L 1 8 C 1 4 9 4 9 8 L 9 9 Z" })
            ]),
            h("g", { "stroke": "none", "fill": "var(--color-fore)", transform: "translate(-0.6, 0.2)" }, [
                h("circle", { cx: 5, cy: 2.5, r: 2.2 }),
                h("path", { d: "M 1 9 L 1 8 C 1 4 9 4 9 8 L 9 9 Z" })
            ]),
        ])
    }
}
