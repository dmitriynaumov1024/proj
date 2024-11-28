import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "none", "fill": "var(--color-fore)" }, [
                h("circle", { cx: 5, cy: 2.5, r: 2.2 }),
                h("path", { d: "M 1 9 L 1 8 C 1 4 9 4 9 8 L 9 9 Z" })
            ])
        ])
    }
}
