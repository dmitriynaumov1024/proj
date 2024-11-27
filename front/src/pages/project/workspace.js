import { h } from "vue"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

export default {
    props: {
        id: String
    },
    data() {
        return {
            project: null,
            errorMessage: null,
            notAuthorized: null
        }
    },
    render() {
        const loc = this.$locale.current
        return h("div", { class: ["h100", "flex-v"] }, [
            h(HeaderLayout, { hless: true, wfull: true }, ()=> [
                h("h2", { class: ["clickable"] }, loc.workspace.self)
            ]),
            h("div", { class: ["bv", "flex-grow", "scroll"] }, [
                h("div", { class: ["pad-05"] }, [
                    this.project? 
                        null :
                    this.errorMessage? 
                        h("p", { class: ["color-bad"] }, this.errorMessage) : 
                        h("p", { }, loc.common.loading),
                    this.notAuthorized? [
                        h("p", { }, h(RouterLink, { to: "/login" }, ()=> loc.action.login)),
                        h("p", { }, h(RouterLink, { to: "/signup" }, ()=> loc.action.signup)),
                    ] : null
                ]),
            ]),
            h(FooterLayout, { style: {"flex-shrink": 0}, hless: true, wfull: true })
        ])
    }
}
