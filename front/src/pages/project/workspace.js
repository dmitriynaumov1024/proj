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
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { }, [
                    h("img", { class: ["icon-15"], src: "/icon/mascot.1.svg" }), " ",
                    h("span", "Proj")
                ])
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["bv"] }, [
                    h("div", { class: ["wc", "pad-1-05"] }, [
                        h("h3", { class: ["mar-b-05"] }, `Project #${this.id}`),
                        this.project? 
                            null :
                        this.errorMessage? 
                            h("p", { class: ["color-bad"] }, this.errorMessage) : 
                            h("p", { }, "Loading, please wait..."),
                        this.notAuthorized? [
                            h("p", { }, h(RouterLink, { to: "/login" }, ()=> "Log in")),
                            h("p", { }, h(RouterLink, { to: "/signup" }, ()=> "Sign up")),
                        ] : null
                    ]),
                ])
            ]),
            h(FooterLayout)
        ])
    }
}
