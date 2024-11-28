import { h } from "vue"

const angles = [ 0, 45, 90, 135, 180, 225, 270, 315 ]

export default {
    render() {
        return h("svg", { viewBox: "0 0 10 10" }, [
            h("g", { "fill": "var(--color-fore)", "stroke": "none" }, [
                angles.map(angle => h("path", { d: "M 4 2.6 L 4.5 0.8 L 5.5 0.8 L 6 2.6 Z", transform: `rotate(${angle}, 5, 5)` }))
            ]),
            h("g", { "fill": "none", "stroke": "var(--color-fore)" }, [
                h("circle", { "stroke-width": 1.3, cx: 5, cy: 5, r: 2.6 })
            ])
        ])
    }
}
