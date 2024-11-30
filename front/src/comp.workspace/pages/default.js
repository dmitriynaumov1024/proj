import { h } from "vue"
import Markdown from "../comp/markdown.js"

export default ({ parent })=> {
    let self = parent
    let loc = self.$locale.current
    let project = self.$storage.project
    return (project instanceof Object)?
    h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
        h("h3", { class: ["mar-b-05"] }, loc.project.description),
        h("div", { }, project.data.description?
            h(Markdown, { text: project.data.description }) :
            h("p", { class: ["color-gray"] }, loc.project.noDescription)
        ),
    ]) : 
    h("div", { class: ["pad-025"] }, [
        h("p", { }, loc.common.loading)
    ])
}
