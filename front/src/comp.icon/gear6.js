import { h } from "vue"

const angles = [ 0, 60, 120, 180, 240, 300 ]

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "fill": "var(--color-fore)", "stroke": "none" }, [
                angles.map(angle => h("path", { d: "M 3.3 2.7 L 4.2 0.8 L 5.8 0.8 L 6.7 2.7 Z", transform: `rotate(${angle}, 5, 5)` }))
            ]),
            h("g", { "fill": "none", "stroke": "var(--color-fore)" }, [
                h("circle", { "stroke-width": 1.7, cx: 5, cy: 5, r: 2.1 })
            ])
        ])
    }
}
