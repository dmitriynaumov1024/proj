import { h } from "vue"

export default ({ parent })=> {
    let self = parent
    let loc = self.$locale.current
    let project = self.$storage.project
    return h("div", { class: ["pad-025"] }, [
        h("h3", { class: ["mar-b-05"] }, "Settings"),
        h("div", { class: ["mar-b-05"] }, [
            h("p", { }, "Title"),
            h("input", { class: ["block"],
                readonly: true,
                value: project.title
            }),
        ]),
        h("div", { class: ["mar-b-05"] }, [
            h("p", { }, "Description"),
            h("textarea", { class: ["block", "height-10"],
                readonly: true,
                value: project.data.description 
            })
        ])
    ])
}
