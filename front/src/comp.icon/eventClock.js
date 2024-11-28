import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none" }, [
                h("circle", { "stroke-width": 0.7, cx: 6, cy: 5, r: 3.3 }),
                h("path", { "stroke-width": 0.8, d: "M 6.2 2.2 L 6.2 5.2 L 4.47 6.2" }),
                h("path", { "stroke-width": 1.2, d: "M 1 1 L 1 5.5 M 1 6.5 L 1 7.7" })
            ])
        ])
    }
}
