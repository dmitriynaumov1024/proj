import { h } from "vue"
import { RouterLink } from "vue-router"

export default {
    render() { 
        return h("div", { class: ["bv"] }, [
            h("div", { class: ["wc", "pad-05"] }, [
                h("div", { class: ["flex-stripe", "flex-pad-05"] }, [
                    h("img", { class: ["icon-15"], src: "/icon/mascot.1.svg" }),
                    this.$slots.default()
                ])
            ])
        ])
    }
}
