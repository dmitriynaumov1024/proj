import { h } from "vue"

const defaultRoute = "index"

export default ({ parent })=> {
    let self = parent
    let loc = self.$locale.current 
    return h("div", { class: ["pad-025"] }, [
        h("h3", { class: ["mar-b-05"] }, "Error"),
        h("p", { }, `${loc.error.notFound} (${self.route})`),
        h("p", h("a", { onClick: ()=> self.navigate(defaultRoute) }, "<< Back to index page"))
    ])
}
