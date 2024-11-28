import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "none", "fill": "var(--color-fore)" }, [
                h("path", { d: "M 3.4 6 L 3.4 9.0 L 6.1 6 Z" }),
                h("rect", { x: 1, y: 1.7, width: 8.0, height: 4.8, rx: 1.3 })
            ])
        ])
    }
}
