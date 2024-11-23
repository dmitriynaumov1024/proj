import { h } from "vue"
import { RouterLink } from "vue-router"

export default {
    render() { 
        return h("div", { class: ["bv"] }, [
            h("div", { class: ["wc", "pad-05"] }, [
                this.$slots.default()
            ])
        ])
    }
}
