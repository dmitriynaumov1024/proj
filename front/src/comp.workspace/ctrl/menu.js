import { h } from "vue"

export default {
    props: {
        items: Array // [...{ name: String, items: [...{ name: String, icon?: VueComponent }] }]
    },
    emits: [ 
        "click" // args: ( item )
    ],
    render() {
        return h("div", { class: ["wsp-menu"] }, [
            this.items.map(category=> h("div", { class: ["bv", "pad-05"] }, [
                h("p", { class: ["pad-025", "color-gray", "text"] }, category.name),
                category.items.map(item=> h("div", { class: ["clickable", "flex-stripe", "flex-pad-05", "pad-025", "flex-center"] }, [
                    item.icon? h(item.icon, { class: ["icon-10", "color-gray"] }) : null,
                    h("span", { class: ["flex-grow", "text"] }, item.name)
                ])),
            ]))
        ])
    }
}
