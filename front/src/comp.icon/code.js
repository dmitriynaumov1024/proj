import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none" }, [
                h("path", { "stroke-width": 1, d: "M 3.1 3.3 L 0.8 5.2 L 3.1 7.1 M 5.9 2.1 L 4.1 8.0 M 6.9 3.3 L 9.2 5.2 L 6.9 7.1" }),
            ])
        ])
    }
}
