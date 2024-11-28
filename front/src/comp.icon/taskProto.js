import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none", "stroke-width": 0.8 }, [
                h("path", { d: "M 7.7 8.8 L 2.3 8.8 L 2.3 2.1 L 3.2 1.3 L 7.7 1.3 L 7.7 8.8 Z" })
            ]),
            h("g", { "stroke": "none", "fill": "var(--color-fore)" }, [
                h("path", { d: "M 5.5 2.0 L 3.5 5.4 L 5 5.4 L 4.5 8.0 L 6.5 4.6 L 5 4.6 L 5.5 2.0 Z"})
            ])
        ])
    }
}
