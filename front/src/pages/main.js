import { h } from "vue"
import { RouterLink } from "vue-router"

export default {
    render() {
        return h("div", { }, [
            h("p", { }, "This is main page."),
            h("p", { }, h(RouterLink, { to: "/project" }, ()=> "Go to project page >>"))
        ])
    }
}
