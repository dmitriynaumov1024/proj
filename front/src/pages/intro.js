import { h } from "vue"
import { RouterLink } from "vue-router"

import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

export default {
    render() {
        let loc = this.$locale.current
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { class: ["clickable"], onClick: ()=> this.$router.push("/") }, loc.app.name)
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["wc", "pad-1-05"] }, [
                    h("h3", { class: ["mar-b-1"] }, "Welcome to Proj!"),
                    h("p", { class: ["mar-b-05"] }, h(RouterLink, { to: "/user/discover" }, ()=> loc.user.discover)),
                    h("p", { class: ["mar-b-05"] }, h(RouterLink, { to: "/login" }, ()=> loc.action.login)),
                    h("p", { class: ["mar-b-05"] }, h(RouterLink, { to: "/signup" }, ()=> loc.action.signup))
                ]),
            ]),
            h(FooterLayout)
        ])
    }
}
