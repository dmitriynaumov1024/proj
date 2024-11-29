import { h } from "vue"

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "stroke": "none", "fill": "var(--color-fore)" }, [
                h("rect", { x: 2.5, y: 3.125, width: 5, height: 0.5 }),
                h("rect", { x: 2.5, y: 4.75, width: 5, height: 0.5 }),
                h("rect", { x: 2.5, y: 6.375, width: 5, height: 0.5 }),
            ])
        ])
    }
}
