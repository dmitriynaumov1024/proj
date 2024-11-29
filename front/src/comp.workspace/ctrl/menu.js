import { h } from "vue"

const menuItemClass = ["clickable", "flex-stripe", "flex-pad-05", "pad-025", "flex-center"]

export default {
    props: {
        items: Array, // [...{ name: String, items: [...{ name: String, icon?: VueComponent }] }]
        activeItem: Function,
        expand: Boolean,
    },
    emits: [ 
        "click" // args: ( item )
    ],
    render() {
        return h("div", { class: ["wsp-menu"], expand: this.expand }, [
            this.items.map(category=> h("div", { class: ["bv", "pad-05"] }, [
                h("p", { class: ["pad-025", "color-gray", "text"] }, category.name),
                category.items.map(item=> h("div", { 
                    class: menuItemClass, 
                    active: (this.activeItem instanceof Function)? this.activeItem(item): false, 
                    onClick: ()=> this.$emit("click", item) }, [
                    item.icon? h(item.icon, { class: ["icon-10", "color-gray"] }) : null,
                    h("span", { class: ["flex-grow", "text"] }, item.name)
                ])),
            ]))
        ])
    }
}
