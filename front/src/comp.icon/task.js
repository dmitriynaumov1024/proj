import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none", "stroke-width": 0.8 }, [
                h("path", { d: "M 7.7 8.8 L 2.3 8.8 L 2.3 2.1 L 3.2 1.3 L 7.7 1.3 L 7.7 8.8 Z" }),
                h("path", { d: "M 3.3 3.5 L 6.6 3.5 M 3.3 5.0 L 6.6 5.0 M 3.3 6.5 L 5.5 6.5 " })
            ])
        ])
    }
}
