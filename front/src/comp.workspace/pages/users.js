import { h } from "vue"

export default ({ parent })=> {
    let self = parent
    let loc = self.$locale.current
    let project = self.$storage.project
    return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
        h("h3", { class: ["mar-b-05"] }, loc.user.plural),
        h("div", { class: ["mar-b-05"] }, [
            project.data.users?
            Object.entries(project.data.users).map(([key, user])=> [
                (user instanceof Object)?
                h("div", { class: ["mar-b-05", "user-card"] }, [
                    h("p", { }, h("b", { }, "@"+user.userName)),
                    h("p", { }, [loc.user.email, ": ", user.email]),
                    h("p", { }, [loc.project.permission.self, ": ", loc.project.permission[user.permission]])
                ]) : null
            ]) : h("p", { }, loc.user.nothing)
        ])
    ])
}
