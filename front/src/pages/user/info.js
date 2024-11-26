import { h } from "vue"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

import { timestampToDayMonthYear, getTimeZone } from "@/lib/utils.js"
const tz = getTimeZone()

function UserView (self) {
    const loc = self.$locale.current
    return [
        h("div", { class: ["mar-b-1"] }, [
            h("h2", { }, self.user.displayName ?? `${loc.user.self} @${self.user.userName}`)
        ]),
        h("div", { class: ["mar-b-05"] }, [
            h("p", { class: ["color-gray"] }, loc.user.userName),
            h("p", { }, self.user.userName),
        ]),
        h("div", { class: ["mar-b-05"] }, [
            h("p", { class: ["color-gray"] }, loc.user.email),
            h("p", { }, self.user.email),
        ]),
        h("div", { class: ["mar-b-05"] }, [
            h("p", { class: ["color-gray"] }, loc.user.createdAt),
            h("p", { }, timestampToDayMonthYear(self.user.createdAt, tz, loc.month)),
        ]),
    ]
}


export default {
    props: {
        userName: String
    },
    data() {
        return {
            user: null,
            projects: null,
            errorMessage: null,
            notAuthorized: false,
        }
    },
    watch: {
        userName: {
            immediate: true,
            handler (newValue, oldValue) {
                this.getUser()
            }
        }
    },
    methods: {
        async getUser() {
            let loc = this.$locale.current
            let result = await this.$http.invoke("/user/find", { user: { userName: this.userName }})
            if (result.success) {
                this.user = result.user
            }
            else if (result.notFound) {
                this.errorMessage = loc.error.notFound
            }
            else {
                this.errorMessage = loc.error.other
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
                    h("div", { class: ["wc", "pad-1-05"] }, [
                        this.user? 
                            UserView(this) :
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
                        h("h3", { class: ["mar-b-05"] }, loc.projects.plural),
                        ProjectListView(this, this.projects)
                    ])
                ]) : null
            ]),
            h(FooterLayout)
        ])
    }
}
