import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "var(--color-fore)", "fill": "none", "stroke-width": 0.8 }, [
                h("path", { d: "M 0.8 5 L 3.4 5 L 4.6 2.2 L 4.7 2.2 L 5.3 7.7 L 5.4 7.7 L 6.6 5 L 9.2 5" })
            ])
        ])
    }
}
