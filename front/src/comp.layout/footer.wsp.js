import { h } from "vue"
import { RouterLink } from "vue-router"

export default {
    props: {
        hless: Boolean,
        wfull: Boolean,
    },
    render() {
        return h("div", { class: ["bv"] }, [
            h("div", { class: [this.wfull?null:"wc", this.hless?"pad-025":"pad-1-05"] }, [
                h("p", { class: "color-gray" }, [
                    h("span", { }, "Proj"), " ", 
                    h("span", { }, "(c) 2024 Dmytro Naumov")
                ])
            ])
        ])
    }
}
