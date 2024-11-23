import { h } from "vue"
import { RouterLink } from "vue-router"

import HeaderLayout from "../comp.layout/header.js"
import FooterLayout from "../comp.layout/footer.js"

export default {
    render() {
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { }, [
                    h("img", { class: ["icon-20"], src: "/icon/mascot.1.svg" }), " ",
                    h("span", "Proj")
                ])
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["wc", "pad-1-05"] }, [
                    h(RouterLink, { to: "/login" }, ()=> "Log in")
                ])
            ]),
            h(FooterLayout)
        ])
    }
}

