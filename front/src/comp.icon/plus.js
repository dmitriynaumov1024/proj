import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none" }, [
                h("path", { "stroke-width": 1, d: "M 2.5 5 L 7.5 5 M 5 2.5 L 5 7.5" })
            ])
        ])
    }
}
