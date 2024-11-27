import { h } from "vue"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"
import Modal from "@/comp.layout/modal.js"
import StepperBox from "@/comp.ctrl/stepperbox.js"

import { idToColor } from "@/lib/utils.js"
import { timestampToDayMonthYear, getTimeZone } from "@/lib/utils.js"
const tz = getTimeZone()

const PLs = ["none", "view", "comment", "edit", "admin", "owner"]

function ProjectInfoView(self) {
    const loc = self.$locale.current
    const canAddUsers = self.involvement?.permission == "admin"
                     || self.involvement?.permission == "owner"
    const canSeeWorkspace = self.involvement?.permission != "none"
    return (self.project instanceof Object)? [
        // project info
        h("div", { class: ["bv", "pad-05-0"] }, [
            h("div", { style: { "background-color": self.project.idColor, "color": "white" }, class: ["mar-b-05", "pad-1-05"] }, [,
                h("h2", { }, self.project.title || `${loc.project.self} #${self.project.id}`)
            ]),
            h("p", { class: ["mar-b-05"] }, `${loc.project.createdAt}: ${timestampToDayMonthYear(self.project.createdAt, tz)}`),
            // own involvement info
            (self.involvement instanceof Object)? [
                self.involvement.interactedAt?
                h("p", { class: ["mar-b-05"] }, `${loc.project.interactedAt}: ${timestampToDayMonthYear(self.involvement.interactedAt, tz)}`) :
                h("p", { class: ["mar-b-05"] }, `${loc.project.invitedAt}: ${timestampToDayMonthYear(self.involvement.sentAt, tz)}`),
                h("p", { class: ["mar-b-05"] }, `${loc.project.permission.self}: ${loc.project.permission[self.involvement.permission]}`),
                canSeeWorkspace?
                h("p", { class: ["mar-b-05"] }, h(RouterLink, { to: "/project/workspace/"+self.id, target: "_blank" }, ()=>loc.project.goToWorkspace+" >>")) : null
            ] : null
        ]),
        // users involved in the project
        (self.users instanceof Array)? h("div", { class: ["bv", "pad-05-0"] }, [
            h("h2", { class: ["mar-b-05"] }, loc.user.plural),
            canAddUsers?
            h("button", { class: ["mar-b-05", "block"], 
                onClick: ()=> self.onBeginAddUser() }, `+ ${loc.project.addUser}`) : null,
            self.users.map(u=> h("div", { class:["mar-b-05", "user-card", "flex-stripe", "flex-pad-05"] }, [
                h("div", { style: { "background-color": u.idColor, "width": "2.5rem", "flex-shrink": 0, "text-align": "center", "color": "white" } }, h("h2", { }, u.user.userName[0]?.toUpperCase())), 
                h("div", { class: ["flex-grow"] }, [
                    h("p", { }, h("b", { }, `${u.user.displayName ?? loc.user.self} @${u.user.userName}`)),
                    h("p", { class: ["color-gray"] }, `${loc.user.email}: ${u.user.email}`),
                    u.interactedAt?
                    h("p", { class: ["color-gray"] }, `${loc.project.interactedAt}: ${timestampToDayMonthYear(u.interactedAt, tz)}`) :
                    h("p", { class: ["color-gray"] }, `${loc.project.invitedAt}: ${timestampToDayMonthYear(u.sentAt, tz)}`),
                    h("p", { class: ["color-gray", "mar-b-05"] }, `${loc.project.permission.self}: ${loc.project.permission[u.permission]}`)
                ])
            ]))
        ]) : null
    ] : null
}

function AddingUserModal(self) {
    const loc = self.$locale.current
    return h(Modal, { titleText: loc.project.addUser, 
        onClickOutside: ()=> self.onCompleteAddUser(false) }, ()=> [
        h("div", { class: ["mar-b-05"] }, [
            h("p", { }, loc.user.userName),
            h("input", { class: ["block",], placeholder: "user", 
                value: self.addingUser.userName,
                onChange: (e)=> self.addingUser.userName = e.target.value,
                invalid: !!self.addingUser.bad
            }),
        ]),
        h("div", { class: ["mar-b-05"] }, [
            h("p", { }, loc.project.permission.self),
            h(StepperBox, { class: ["flex-stripe"],
                text: loc.project.permission[PLs[self.addingUser.pLevel??0]],
                min: 0, max: PLs.length-1, step: 1, value: self.addingUser.pLevel??0, 
                onChange: (value)=> self.addingUser.pLevel = value 
            }),
        ]),
        h("button", { class: ["block"], onClick: ()=> self.onCompleteAddUser(true) }, loc.action.proceed)
    ])
}


export default {
    props: {
        id: String
    },
    data() {
        return {
            project: null,
            owner: null,
            involvement: null,
            users: null,
            errorMessage: null,
            notAuthorized: null,

            addingUser: null,
        }
    },
    watch: {
        id: {
            immediate: true,
            handler (newValue, oldValue) {
                if (!newValue) this.errorMessage = this.$locale.current.error.notFound
                else if (newValue!=oldValue) this.getProject()
            }
        }
    },
    methods: {
        async getProject() {
            this.errorMessage = null
            this.notAuthorized = null
            let result = await this.$http.invoke("/project/find", { project: { id: this.id } })
            if (result.success) {
                result.project.idColor = await idToColor(result.project.id)
                this.project = result.project
                this.involvement = result.projectInvolvement
                if (this.project.ownerId) await this.getProjectOwner()
                await this.getProjectUsers()
            }
            else if (result.notAuthorized) {
                this.notAuthorized = true
                this.errorMessage = this.$locale.current.error.notAuthorized
            }
            else if (result.notFound) {
                this.notFound = this.$locale.current.error.notFound
            }
        },
        async getProjectOwner() {
            let result = await this.$http.invoke("/user/find", { user: { id: this.project.ownerId } })
            if (result.success) {
                this.owner = result.user
            }
        },
        async getProjectUsers() {
            let result = await this.$http.invoke("/user/in-project", { project: { id: this.project.id } })
            if (result.success) {
                for (let u of result.users) {
                    u.idColor = await idToColor(u.receiverId)
                }
                this.users = result.users
            }
        },
        async addUserToProject() {
            if (this.users.find(u=> u.receiver.userName == this.addingUser.userName)) {
                this.addingUser = null
                return
            }
            let { user } = await this.$http.invoke("/user/find", { 
                user: { userName: this.addingUser.userName } 
            })
            if (!user) {
                this.addingUser.bad = true 
                return
            }
            let result = await this.$http.invoke("/project/involvement/create", { 
                project: { id: this.project.id, permission: PLs[this.addingUser.pLevel] },
                receiver: { id: user.id, },
                sender: { id: this.involvement.receiverId }
            })
            if (result.success) {
                this.addingUser = null
                this.getProjectUsers()
            }
            else if (result.exists) {
                this.addingUser = null
            }
            else {
                this.addingUser.bad = true
            }
        },
        onBeginAddUser() {
            this.addingUser = { }
        },
        onCompleteAddUser(confirm) {
            if (confirm) this.addUserToProject()
            else this.addingUser = null 
        }
    },
    render() {
        const loc = this.$locale.current
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { class: ["clickable"], onClick: ()=> this.$router.push("/") }, loc.app.name)
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["bv"] }, [
                    h("div", { class: ["wc", "pad-05"] }, [
                        this.project? 
                            ProjectInfoView(this) :
                        this.errorMessage? 
                            h("p", { class: ["color-bad"] }, this.errorMessage) : 
                            [ h("h3", { class: ["mar-b-05"] }, `${loc.project.self} #${this.id}`),
                              h("p", { }, loc.common.loading) ],
                        this.notAuthorized? [
                            h("p", { }, h(RouterLink, { to: "/login" }, ()=> loc.action.login)),
                            h("p", { }, h(RouterLink, { to: "/signup" }, ()=> loc.action.signup)),
                        ] : null,
                        this.addingUser?
                            AddingUserModal(this) : null
                    ]),
                ])
            ]),
            h(FooterLayout)
        ])
    }
}
