import { h } from "vue"

let a = [1, 2, 3, 4, 5, 6,]

export default {
    props: ["title"],
    render() {
        return h("svg", { viewBox: "0 0 80 10" }, [
            this.title? h("title", { }, this.title): null,
            h("g", { "stroke": "none", "fill": "#99f6ff" }, [
                h("path", { d: "M 0.2 5 L 54.9 5 L 52.7 5.8 L 0 5.8", transform: "translate(17.9, 0)" })
            ]),
            h("g", { "stroke-width": 0.2, "stroke": "var(--color-accent)", "fill": "none" }, [
                //a.map(i=> h("path", { d: "M 0 3.0 L 3.7 3.0 L 3.7 3.8 M 4.3 3.8 L 4.3 3.0 L 8 3.0 M 0 7 L 3.7 7 L 3.7 6.2 M 4.3 6.2 L 4.3 7 L 8 7", transform: `translate(${i*8+10}, 0)` }))
                a.map(i=> h("path", { d: "M 0 3.9 L 8 3.9 L 5.4 6.1 M 0 6.1 L 7.0 6.1", transform: `translate(${i*8+10.5}, 0)` })),
                h("path", { d: "M 0 3.9 L 4.5 3.9 L 7 5 L 4.5 6.1 L 0 6.1", transform: "translate(66.5, 0)" }),
            ]),
            h("g", { "stroke": "none", "fill": "var(--color-accent)" }, [
                h("path", { d: "M -1.6 0 L 0 1.8 L 1.6 0 L 0 -1.8 Z", transform: "translate(2, 5)" }),
                h("path", { d: "M -1.7 0 L 0 1.5 L 1.7 0 L 0 -1.5 Z", transform: "translate(17, 2)" }),
                h("path", { d: "M -1.7 0 L 0 1.5 L 1.7 0 L 0 -1.5 Z", transform: "translate(17, 8)" }),
                h("path", { d: "M 0 2.5 L 1.6 2.5 L 1.6 7.5 L 0 7.5 Z", transform: "translate(16.2, 0)" }),
                h("path", { d: "M 0 4.5 L 16.6 4.1 L 16.3 5.9 L 0 5.5 Z", transform: "translate(2, 0)" })
            ])
        ])
    }
}
