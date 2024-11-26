import { h } from "vue"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

import { idToColor } from "@/lib/utils.js"

function ProjectListView (self, projects) {
    return (projects?.length > 0)? 
    h("div", { class: ["flex-stripe", "flex-pad-05", "flex-wrap"] }, [
        projects.map(p=> {
            return h("div", { class: ["project-card"] }, [
                h("div", { style: { height: "5em", "background-color": p.idColor } }),
                h("p", { class: ["pad-05"] }, h("b", { }, p.project.title))
            ])
        })
    ]) : 
    h("p", { class: ["mar-b-05", "text-center"] }, "No projects so far...")
}


export default {
    props: {
        page: Number
    },
    data() {
        return {
            projects: null,
            errorMessage: null,
            notAuthorized: null
        }
    },
    render() {
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { class: ["clickable"], onClick: ()=> this.$router.push("/") }, loc.app.name)
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["bv"] }, [
                    h("div", { class: ["wc", "pad-1-05"] }, [
                        h("h3", { class: ["mar-b-05"] }, `Project #${this.id}`),
                        this.projects? 
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
