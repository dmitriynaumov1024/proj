import { h } from "vue"
import { RouterLink } from "vue-router"

export default {
    props: {
        hless: Boolean,
        wfull: Boolean
    },
    render() { 
        return h("div", { class: ["bv"] }, [
            h("div", { class: [this.wfull?null:"wc", this.hless?"pad-025":"pad-05"] }, [
                h("div", { class: ["flex-stripe", "flex-pad-05"] }, [
                    h("img", { class: ["icon-20"], src: "/icon/mascot.1.svg" }),
                    this.$slots.default()
                ])
            ])
        ])
    }
}
