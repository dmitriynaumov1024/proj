import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "none", "fill": "var(--color-fore)" }, [
                h("rect", { x: 1, y: 1, width: 2, height: 6.5 }),
                h("rect", { x: 4, y: 1, width: 2, height: 8 }),
                h("rect", { x: 7, y: 1, width: 2, height: 4 }),
            ])
        ])
    }
}
