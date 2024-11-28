import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none", "stroke-width": 0.8 }, [
                h("path", { d: "M 1.9 7.8 L 1.0 7.8 L 1.0 2.3 L 2.1 1.3 L 6.5 1.3 L 6.5 2.3" }),
                h("path", { d: "M 8.1 9.2 L 2.6 9.2 L 2.6 3.5 L 3.5 2.7 L 8.1 2.7 L 8.1 9.2 Z" }),
                h("path", { d: "M 3.8 4.6 L 7.0 4.6 M 3.8 5.9 L 7.0 5.9 M 3.8 7.2 L 5.8 7.2" })
            ])
        ])
    }
}
