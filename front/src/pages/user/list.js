// searchable, discoverable, very cool list of users

import { h } from "vue"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

function UserListView (self, users) {
    let loc = self.$locale.current
    return h("div", { }, [
        users?.length > 0?
        users.map(user => h("div", { class: "mar-b-05", onClick: ()=> self.onGoToUser(user) }, [
            h("p", { }, h("b", { }, user.displayName ?? "@"+user.userName)),
            h("p", { class: ["color-gray"] }, `@${user.userName} : : ${user.email}`)
        ])) :
        h("p", loc.user.nothing)
    ])
}

export default {
    props: {
        query: String
    },
    data() {
        return {
            newQuery: "",
            users: [],
            errorMessage: null,
            notAuthorized: null
        }
    },
    watch: {
        query: {
            immediate: true,
            handler (newValue, oldValue) {
                if (newValue?.length && newValue != oldValue) this.getUsers(newValue)
            }
        }
    },
    methods: {
        async getUsers(query) {
            this.errorMessage = null
            this.notAuthorized = null
            let loc = this.$locale.current
            let result = await this.$http.invoke("/user/find-by-username", {
                user: { userName: query }
            })
            if (result.success && result.users) {
                this.users = result.users
                return
            }
            this.users = null
            if (result.notFound) {
                this.errorMessage = loc.error.notFound
            }
            if (result.notAuthorized) {
                this.errorMessage = loc.error.notAuthorized
            }
        },
        onNewSearch() {
            this.$router.patchQuery({ query: this.newQuery })
        },
        onGoToUser(user) {
            if (user?.id) this.$router.push("/user/info/"+user.userName)
        }
    },
    render() {
        const loc = this.$locale.current
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { class: ["clickable"], onClick: ()=> this.$router.push("/") }, loc.app.name)
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["bb", "mar-b-05", "pad-05"] }, [
                    h("h3", { class: ["mar-b-05"] }, loc.user.discover),
                    h("div", { class: ["flex-stripe", "flex-pad-05"] }, [
                        h("input", { class: ["flex-grow"], 
                            value: this.newQuery, 
                            onChange: (e)=> this.newQuery = e.target.value, 
                        }),
                        h("button", { 
                            class: [], 
                            onClick: ()=> this.onNewSearch() 
                        }, loc.action.search)
                    ])
                ]),
                h("div", { class: ["pad-05"] }, [
                    (this.users instanceof Array)?
                        UserListView(this, this.users) :
                    this.errorMessage? 
                        h("p", { }, this.errorMessage) : 
                        h("p", { }, loc.common.loading),
                    this.notAuthorized? [
                        h("p", { }, h(RouterLink, { to: "/login" }, ()=> loc.action.login)),
                        h("p", { }, h(RouterLink, { to: "/signup" }, ()=> loc.action.signup)),
                    ] : null
                ])
            ]),
            h(FooterLayout)
        ])
    }
}

