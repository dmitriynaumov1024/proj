import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "none", "fill": "var(--color-fore)" }, [
                h("rect", { x: 1, y: 1, width: 8, height: 2 }),
                h("rect", { x: 1, y: 4, width: 8, height: 2 }),
                h("rect", { x: 1, y: 7, width: 8, height: 2 }),
            ])
        ])
    }
}
