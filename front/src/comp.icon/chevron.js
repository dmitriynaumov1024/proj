import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none" }, [
                h("path", { "stroke-width": 1, d: "M 2.4 4.8 L 5.0 2.5 L 7.6 4.8" }),
                h("path", { "stroke-width": 1, d: "M 2.4 7.4 L 5.0 5.1 L 7.6 7.4" }),
            ])
        ])
    }
}
