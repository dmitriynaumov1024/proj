import { h } from "vue"
import { RouterLink } from "vue-router"

import HeaderLayout from "../comp.layout/header.js"
import FooterLayout from "../comp.layout/footer.js"

function OwnUserView (self) {
    return [
        h("div", { class: ["mar-b-1"] }, [
            h("p", { class: ["color-gray"] }, "Username"),
            h("p", { }, self.user.userName),
        ]),
        h("div", { class: ["mar-b-1"] }, [
            h("p", { class: ["color-gray"] }, "Email"),
            h("p", { }, self.user.email),
        ]),
        h("div", { class: ["mar-b-1"] }, [
            h("p", { class: ["color-gray"] }, "Display Name"),
            h("p", { }, self.user.displayName),
        ]),
        h("div", { class: ["mar-b-1"] }, [
            h("p", { class: ["color-gray"] }, "Signed up on"),
            h("p", { }, self.user.createdAt),
        ]),
    ]
}

function ProjectListView (self, projects) {
    return projects.length? [
        projects.map(p=> {
            return h("p", { class: ["mar-b-05"] }, p.project.title)
        })
    ] : h("p", { class: ["mar-b-05"] }, "No projects so far...")
}

export default {
    data() {
        return {
            user: null,
            errorMessage: null,
            notAuthorized: false,

            projects: null
        }
    },
    methods: {
        async getOwnProfile() {
            let result = await this.$http.invoke("/user/whoami", { })
            if (result.success && result.user) {
                this.user = result.user
                this.getOwnProjectsList()
            }
            else if (result.notAuthorized) {
                this.notAuthorized = true
                this.errorMessage = "You are not logged in."
            }
            else {
                this.errorMessage = "Something went wrong."
            }
        },
        async getOwnProjectsList() {
            let result = await this.$http.invoke("/project/own-list", { project: { receiverStatus: "accepted" } })
            if (result.success) {
                this.projects = result.projects
            }
            else {
                this.errorMessage = "Something went wrong."
            }
        }
    },
    mounted() {
        this.getOwnProfile()
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
                        h("h3", { class: ["mar-b-05"] }, "My profile"),
                        this.user? 
                            OwnUserView(this) :
                        this.errorMessage? 
                            h("p", { class: ["color-bad"] }, this.errorMessage) : 
                            h("p", { }, "Loading, please wait..."),
                        this.notAuthorized? [
                            h("p", { }, h(RouterLink, { to: "/login" }, ()=> "Log in")),
                            h("p", { }, h(RouterLink, { to: "/signup" }, ()=> "Sign up")),
                        ] : null
                    ]),
                ]),
                this.user && (this.projects instanceof Array)?
                h("div", { class: ["bv"] }, [
                    h("div", { class: ["wc", "pad-1-05"] }, [
                        h("h3", { class: ["mar-b-05"] }, "Projects"),
                        ProjectListView(this, this.projects)
                    ])
                ]) : null
            ]),
            h(FooterLayout)
        ])
    }
}
