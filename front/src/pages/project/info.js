import { h } from "vue"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

function ProjectInfoView(self) {
    return h("div", { }, [
        JSON.stringify(self.project, null, "  ")
    ])
}

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
    methods: {
        async getProject() {
            this.errorMessage = null
            this.notAuthorized = null
            let result = await this.$http.invoke("/project/find", { project: { id: this.id } })
            if (result.success) {
                this.project = result.project
            }
            else if (result.notAuthorized) {
                this.notAuthorized = true
            }
            else if (result.notFound) {
                this.notFound = true
            }
        }
    },
    mounted() {
        this.getProject()
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
                        this.project? 
                            ProjectInfoView(this) :
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
