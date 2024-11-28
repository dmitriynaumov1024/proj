import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none" }, [
                h("path", { "stroke-width": 0.8, d: "M 7.5 5.6 L 7.5 8.8 L 2.0 8.8 L 2.0 2.1 L 2.9 1.3 L 7.5 1.3 L 7.5 2.3" }),
                h("path", { "stroke-width": 1.0, d: "M 3.5 3.9 L 5.3 6.1 L 8.4 3" })
            ])
        ])
    }
}
