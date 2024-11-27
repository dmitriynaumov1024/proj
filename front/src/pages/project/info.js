import { h } from "vue"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

import { idToColor } from "@/lib/utils.js"
import { timestampToDayMonthYear, getTimeZone } from "@/lib/utils.js"
const tz = getTimeZone()

function ProjectInfoView(self) {
    const loc = self.$locale.current
    return self.project? [
        h("div", { class: ["bv", "pad-05-0"] }, [
            h("h2", { class: ["mar-b-05"] }, self.project.title || `${loc.project.self} #${self.project.id}`),
            h("p", { class: ["mar-b-05"] }, `${loc.project.createdAt}: ${timestampToDayMonthYear(self.project.createdAt, tz)}`),
            self.involvement? [
                h("p", { class: ["mar-b-05"] }, `${loc.project.interactedAt}: ${timestampToDayMonthYear(self.involvement.interactedAt, tz)}`),
                h("p", { class: ["mar-b-05"] }, `${loc.project.permission.self}: ${loc.project.permission[self.involvement.permission]}`)
            ] : null
        ]),
        self.users? h("div", { class: ["bv", "pad-05-0"] }, [
            h("h2", { class: ["mar-b-05"] }, loc.user.plural),
            self.users.map(u=> h("div", { class:["mar-b-05", "user-card"] }, [
                h("p", { }, h("b", { }, `${u.user.displayName ?? loc.user.self} @${u.user.userName}`)),
                h("p", { class: ["color-gray"] }, `${loc.user.email}: ${u.user.email}`),
                u.interactedAt?
                h("p", { class: ["color-gray"] }, `${loc.project.interactedAt}: ${timestampToDayMonthYear(u.interactedAt, tz)}`) :
                h("p", { class: ["color-gray"] }, `${loc.project.invitedAt}: ${timestampToDayMonthYear(u.invitedAt, tz)}`),
                h("p", { class: ["color-gray", "mar-b-05"] }, `${loc.project.permission.self}: ${loc.project.permission[u.permission]}`)
            ]))
        ]) : null
    ] : null
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
            notAuthorized: null
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
                this.users = result.users
            }
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
                        ] : null
                    ]),
                ])
            ]),
            h(FooterLayout)
        ])
    }
}
