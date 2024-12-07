import { h } from "vue"

export default {
    props: {
        value: Boolean,
        disabled: Boolean,
    },
    emits: [
        "change"
    ],
    render() {
        return h("div", { class: ["inline-block"], onClick: ()=> { if (!this.disabled) this.$emit("change", !this.value) } }, [
            h("span", { class: ["checkbox"], checked: this.value }),
            this.$slots.default()
        ])
    }
}
