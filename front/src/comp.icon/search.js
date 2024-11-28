import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none" }, [
                h("circle", { "stroke-width": 1, cx: 4.3, cy: 4.3, r: 2.5 }),
                h("path", { "stroke-width": 1.4, d: "M 6.1 6.1 L 8.6 8.6" }),
            ])
        ])
    }
}
