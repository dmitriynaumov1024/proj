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
            newTask.title = "New Task eajfiaefsbesa"
            newTask.description = "Some task description"
            newTask.status = "todo"
            this.$storage.project.data.taskObjects[newTask.id] = newTask
        },
        resolveText (field, value) {
            let ds = this.$app.dataSources[field.dataSource]
            if (!ds) return value
            let item = ds.restoreItem.call({ project: this.$storage.project, user: this.$storage.user }, value)
            return ds.convertItem(item)?.text
        }
    },
    render() {
        let project = this.$storage.project
        let loc = this.$locale.current
        let taskFields = project.data.taskFields.Task
        let fields = [
            taskFields.primary.title,
            taskFields.primary.status,
            taskFields.primary.ownerId,
            taskFields.primary.assigned,
            taskFields.primary.createdAt
        ]
        let tasks = Object.values(project.data.taskObjects)
            .filter(item=> item.type == "Task")
            .sort((a, b)=> a.createdAt - b.createdAt)
        return h("div", { class: ["pad-025"], style: { "overflow-x": "hidden", "max-width": "100%" } }, [
            h("h3", { class: ["mar-b-05"] }, "Task list"),
            h("div", { style: { "overflow-x": "scroll", "max-width": "100%" } }, [
                h("div", { class: ["mar-b-05", "task-list-row", "task-list-header"] }, [
                    fields.map(field=> h("b", { class: ["task-list-cell"] }, field.name)),
                    h("span", { class: ["flex-grow", "fake-task-list-cell"] }, "")
                ]),
                tasks.length?
                tasks.map(item=> h("div", { class: ["clickable", "task-list-row"] }, [
                    fields.map(field=> h("span", { class: ["task-list-cell"] }, this.resolveText(field, item[field.name])))
                ])) : 
                h("p", { class: ["pad-05-0"] }, "No tasks so far..."),
                h("div", { class: ["mar-b-05"] })
            ]),
            h("div", { class: ["mar-b-1", "bb"] }, ""),
            h("div", { class: ["mar-b-1"] }, [
                h("button", { class: [], onClick: ()=> this.onCreateTask() }, "+ Create task (dummy)")
            ])
        ])
    }
}
