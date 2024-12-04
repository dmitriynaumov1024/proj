import { h } from "vue"

export default {
    props: {
        parent: Object,
        query: Object
    },
    methods: {
        onCreateTask() {
            let newTask = this.$app.methods.createTaskObject.call({ 
                app: this.$app, 
                project: this.$storage.project, 
                user: this.$storage.user 
            }, "Task")
            newTask.title = "Hello Task"
            newTask.description = "Some task description"
            newTask.status = "todo"
            this.$storage.project.data.taskObjects[newTask.id] = newTask
        }
    },
    render() {
        let project = this.$storage.project
        let loc = this.$locale.current
        let fields = [
            ...Object.values(project.data.taskFields.Task.primary),
            ...Object.values(project.data.taskFields.Task.secondary)
        ].sort((a, b)=> a.index - b.index)
        return h("div", { class: ["pad-025"], style: { "overflow-x": "hidden", "max-width": "100%" } }, [
            h("h3", { class: ["mar-b-05"] }, "Task list"),
            h("div", { style: { "overflow-x": "scroll", "max-width": "100%" } }, [
                h("div", { class: ["pad-025", "mar-b-05"], style: { "white-space": "nowrap" } }, [
                    fields.map(field=> h("b", { style: { "width": "13rem", "display": "inline-block" } }, field.name))
                ]),
                Object.values(project.data.taskObjects)
                .sort((a, b)=> a.createdAt - b.createdAt)
                .map(item=> h("div", { class: ["clickable", "pad-025", "mar-b-05"], style: { "white-space": "nowrap" } }, [
                    fields.map(field=> h("span", { style: { "width": "13rem", "display": "inline-block" } }, item[field.name]))
                ])),
            ]),
            h("div", { class: ["mar-b-1", "bb"] }, ""),
            h("div", { class: ["mar-b-1"] }, [
                h("button", { class: [], onClick: ()=> this.onCreateTask() }, "+ Create task (dummy)")
            ])
        ])
    }
}
