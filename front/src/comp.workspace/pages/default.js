import { h } from "vue"

export default ({ parent })=> {
    let self = parent
    return h("div", { class: ["pad-025"] }, [
        h("h3", { class: ["mar-b-05"] }, "Index page"),
        h("p", h("a", { onClick: ()=> self.navigate("some not existent route") }, "Go to some not existent route >>")),
    ])
}
