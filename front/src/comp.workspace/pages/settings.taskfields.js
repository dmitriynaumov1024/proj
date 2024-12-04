import { h } from "vue"

const TaskFieldsPage = {
    props: {
        parent: Object,
        query: Object
    },
    render() {
        let project = this.$storage.project
        let fieldGroups = [
            {
                name: "primary fields",
                fields: Object.values(project.data.taskFields[this.query.type].primary)
                              .sort((a, b)=> a.index - b.index)
            },
            {
                name: "secondary fields",
                fields: Object.values(project.data.taskFields[this.query.type].secondary)
                              .sort((a, b)=> a.index - b.index)
            }
        ]
        return h("div", { class: ["pad-025"] }, [
            h("div", { }, [
                h("p", { class: ["mar-b-05"] }, [
                    h("a", { onClick: ()=> this.parent.navigate(this.parent.route) }, "Task fields"), " > ",
                    h("span", { }, this.query.type)
                ])
            ]),
            h("div", { style: { "overflow-x": "scroll", "max-width": "100%" } }, [
                h("div", { class: ["list-row", "list-header"] }, [
                    h("b", { class: ["list-cell"] }, "name"),
                    h("b", { class: ["list-cell"] }, "type"),
                    h("b", { class: ["list-cell"] }, "editable"),
                    h("b", { class: ["list-cell"] }, "data source"),
                    h("span", { class: ["flex-grow", "fake-list-cell"] })
                ]),
                fieldGroups.map(group=> [
                    h("div", { class: ["list-row", "list-header"] }, [
                        h("b", { class: ["list-cell"] }, group.name),
                        h("span", { class: ["flex-grow", "fake-list-cell"] })
                    ]),
                    group.fields.length?
                    group.fields.map(field=> h("div", { class: ["list-row", "clickable", "text-mono"] }, [
                        h("span", { class: ["list-cell"] }, field.name),
                        h("span", { class: ["list-cell"] }, field.type),
                        h("span", { class: ["list-cell"] }, field.editable),
                        h("span", { class: ["list-cell"] }, field.dataSource || "-"),
                    ])) :
                    h("list-row", { }, [
                        h("span", { class: ["list-cell", "flex-grow"] }, "no fields so far...")
                    ])
                ])
            ])
        ])
    }
}


const IndexPage = {
    props: {
        parent: Object,
        query: Object
    },
    render() {
        if (this.query.type) {
            return h(TaskFieldsPage, { parent: this.parent, query: this.query })
        }
        let project = this.$storage.project
        return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
            h("div", { class: ["bv"] }, [
                h("h3", { class: ["mar-b-05"] }, "Task fields")
            ]),
            h("div", { class: ["bv"] }, [
                Object.keys(project.data.taskFields).map(type=> [
                    h("p", { class: ["pad-05-0", "clickable", "bv"], onClick: ()=> this.parent.navigate(this.parent.route, { type }) }, [
                        "for type ", h("a", { }, type)
                    ]),
                ])
            ])
        ])
    }
}

export default IndexPage
