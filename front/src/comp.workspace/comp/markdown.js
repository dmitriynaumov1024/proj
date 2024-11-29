import { h } from "vue"
import markdownit from "markdown-it"

let markdown = markdownit({ linkify: "true" }).enable(["link"])

export function mdToHtml(text) {
    return markdown.render(text)
}

export default ({ text })=> {
    return h("div", { class: ["md"], innerHTML: mdToHtml(text) })
}
