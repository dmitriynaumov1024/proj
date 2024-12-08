import { h } from "vue"

export default {
    props: {
        value: undefined,
        items: Array
    },
    data() {
        return {
            expanded: false
        }
    },
    emits: [
        "change"
    ],
    methods: {
        onSelectItem (item) {
            this.expanded = false
            this.$emit("change", item.value)
        },
        onToggleExpand () {
            this.expanded = !this.expanded
        }
    },
    render() {
        return h("div", { class: ["selectbox-wrapper"] }, [
            h("div", { class: ["flex-stripe", "selectbox-header"], onClick: ()=> this.onToggleExpand() }, [
                h("span", { class: ["flex-grow", "one-line"] }, this.items?.find(i=> i.value==this.value)?.text),
                h("span", { class: ["clickable", "pad-0-05"] }, "+")
            ]),
            h("div", { class: ["selectbox-body"], display: this.expanded }, [
                this.items?.map(item=> h("p", { class: ["pad-025", "clickable"], onClick: ()=> this.onSelectItem(item) }, item.text))
            ])
        ])
    }
}
