import { h } from "vue"
import { RouterLink } from "vue-router"

export default {
    render() {
        return h("div", { class: ["bv"] }, [
            h("div", { class: ["wc", "pad-1-05"] }, [
                h("p", { class: "color-gray" }, [
                    h(RouterLink, { to: "/", class: ["color-gray"] }, ()=> "Proj"), " ", 
                    h("span", { }, "(c) 2024 Dmytro Naumov")
                ])
            ])
        ])
    }
}
