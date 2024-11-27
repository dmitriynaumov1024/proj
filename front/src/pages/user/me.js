import { h } from "vue"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"
import Modal from "@/comp.layout/modal.js"

import { idToColor } from "@/lib/utils.js"
import { timestampToDayMonthYear, getTimeZone } from "@/lib/utils.js"
const tz = getTimeZone()

function OwnUserView (self) {
    const loc = self.$locale.current
    return [
        h("div", { class: ["mar-b-1"] }, [
            h("p", { class: ["color-gray"] }, loc.user.userName),
            h("p", { }, self.user.userName),
        ]),
        h("div", { class: ["mar-b-1"] }, [
            h("p", { class: ["color-gray"] }, loc.user.email),
            h("p", { }, self.user.email),
        ]),
        h("div", { class: ["mar-b-1"] }, [
            h("p", { class: ["color-gray"] }, loc.user.displayName),
            h("p", { }, self.user.displayName),
        ]),
        h("div", { class: ["mar-b-1"] }, [
            h("p", { class: ["color-gray"] }, loc.user.createdAt),
            h("p", { }, timestampToDayMonthYear(self.user.createdAt, tz, loc.month)),
        ]),
    ]
}

function ProjectListView (self, projects) {
    let loc = self.$locale.current
    return (projects?.length > 0)? 
    h("div", { class: ["flex-stripe", "flex-pad-05", "flex-wrap"] }, [
        projects.map(p=> h("div", { class: ["project-card"], onClick: ()=> self.$router.push("/project/info/"+p.project.id) }, [
            h("svg", { style: { display: "block" }, viewBox: "0 0 10 4.5" }, [
                h("rect", { x: 0, y: 0, width: 10, height: 4.5, stroke: "none", fill: p.idColor })
            ]),
            h("div", { class: ["pad-05"] }, [
                h("p", { class: ["one-line"] }, h("b", { }, p.project.title)),
                h("p", { }, h(RouterLink, { to: "/project/workspace/"+p.project.id, target: "_blank" }, ()=> loc.project.goToWorkspace+" >>")),
            ])
        ])),
        h("div", { class: ["project-card"], disabled: true }, " "),
        h("div", { class: ["project-card"], disabled: true }, " "),
    ]) : 
    h("p", { class: ["mar-b-05", "text-center"] }, loc.project.nothing)
}

function LogoutModal (self) {
    let loc = self.$locale.current
    return h(Modal, { titleText: loc.logout.header, onClickOutside: ()=> self.onCompleteLogout() }, ()=> [
        h("p", { class: ["mar-b-1"] }, loc.logout.confirmation),
        h("div", { class: ["flex-stripe", "flex-pad-05"] }, [
            h("button", { class: ["flex-grow"], onClick: ()=> self.onCompleteLogout() }, loc.action.cancel),
            h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> self.onCompleteLogout(true) }, h("b", { }, loc.action.logout))
        ])
    ])
}

function CreatingProjectModal (self, project) {
    let loc = self.$locale.current
    return h(Modal, { titleText: `${loc.action.create} ${loc.project.self}`, onClickOutside: ()=> self.onCompleteCreateProject() }, ()=> [
        h("p", { }, loc.project.title),
        h("input", {
            class: ["block", "mar-b-1"],
            value: project.title,
            onChange: (e)=> project.title = e.target.value
        }),
        h("div", { class: ["flex-stripe", "flex-pad-05"] }, [
            h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> self.onCompleteCreateProject() }, loc.action.cancel),
            h("button", { class: ["flex-grow"], onClick: ()=> self.onCompleteCreateProject(true) }, h("b", { }, loc.action.create))
        ])
    ])
}

export default {
    data() {
        return {
            user: null,
            projects: null,
            errorMessage: null,
            notAuthorized: false,
            loggingOut: false,
            creatingProject: null
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
                this.errorMessage = this.$locale.current.error.notAuthorized
            }
            else {
                this.errorMessage = this.$locale.current.error.other
            }
        },
        async getOwnProjectsList() {
            let result = await this.$http.invoke("/project/own-list", { project: { receiverStatus: "accepted" } })
            if (result.success) {
                for (let p of result.projects) {
                    p.idColor = await idToColor(p.projectId)
                }
                this.projects = result.projects
            }
            else {
                this.errorMessage = this.$locale.current.error.other
            }
        },
        async createProject() {
            let result = await this.$http.invoke("/project/create", { project: { title: this.creatingProject.title } })
            if (result.success) {
                this.creatingProject = null
                this.getOwnProjectsList()
            }
            else {
                this.creatingProject.errorMessage = this.$locale.current.error.other
            }
        },
        onBeginLogout() {
            this.loggingOut = true
        },
        onCompleteLogout(confirm) {
            this.loggingOut = false
            if (!confirm) return
            this.$http.session = { }
            this.$router.push("/")
        },
        onBeginCreateProject() {
            this.creatingProject = { title: "" }
        },
        onCompleteCreateProject(confirm) {
            if (confirm) this.createProject()
            else this.creatingProject = null
        }
    },
    mounted() {
        this.getOwnProfile()
    },
    render() {
        let loc = this.$locale.current
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { class: ["clickable"], onClick: ()=> this.$router.push("/") }, loc.app.name)
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["bv"] }, [
                    h("div", { class: ["wc", "pad-1-05"] }, [
                        h("div", { class: ["flex-stripe", "mar-b-05"] }, [
                            h("h2", { class: ["flex-grow"] }, loc.user.ownProfile),
                            h("button", { class: ["pad-025-05"], onClick: ()=> this.onBeginLogout() }, loc.action.logout)
                        ]),
                        this.loggingOut? 
                            LogoutModal(this) : 
                            null,
                        this.user? 
                            OwnUserView(this) :
                        this.errorMessage? 
                            h("p", { class: ["color-bad"] }, this.errorMessage) : 
                            h("p", { }, loc.common.loading),
                        this.notAuthorized? [
                            h("p", { }, h(RouterLink, { to: "/login" }, ()=> loc.action.login)),
                            h("p", { }, h(RouterLink, { to: "/signup" }, ()=> loc.action.signup)),
                        ] : null
                    ]),
                ]),
                this.user && (this.projects instanceof Array)?
                h("div", { class: ["bv"] }, [
                    h("div", { class: ["wc", "pad-1-05"] }, [
                        h("div", { class: ["flex-stripe", "mar-b-1"] }, [
                            h("h2", { class: ["flex-grow"] }, loc.project.plural),
                            h("button", { class: ["pad-025-05"], onClick: ()=> this.onBeginCreateProject() }, "+ "+loc.action.create)
                        ]),
                        ProjectListView(this, this.projects)
                    ])
                ]) : null,
                this.user && (this.creatingProject instanceof Object)?
                CreatingProjectModal(this, this.creatingProject) : null,
            ]),
            h(FooterLayout)
        ])
    }
}
