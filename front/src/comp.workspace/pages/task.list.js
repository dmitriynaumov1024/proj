import { h } from "vue"
import Modal from "@/comp.layout/modal.js"
import Selectbox from "@/comp.ctrl/selectbox.js"
import { EditTaskModal } from "../comp/edittaskmodal.js"

import { nestedClone } from "common/utils/object"
import { timestampToHHMM, timestampToDayMonthYear, days } from "@/lib/utils.js"

import * as ico from "@/comp.icon/index.js"
function resolveIcon (type) {
    if (type == "Task") {
        return ico.TaskIcon
    }
    else if (type == "TaskSet") {
        return ico.TaskListIcon
    }
    else if (type == "Milestone") {
        return ico.MilestoneIcon
    }
    else return ()=> null
}

export default {
    props: {
        parent: Object,
        query: Object
    },
    data() {
        return {
            editingTask: null,
        }
    },
    computed: {
        canEdit() {
            let { project, user } = this.$storage
            let pl = project.data.users[user.id]?.permission
            return pl == "edit" || pl == "admin" || pl == "owner"
        }
    },
    methods: {
        async updateTask (task) {
            await this.$socket.ready()
            this.$socket.send("UpdateTask", { update: task })
            this.editingTask = null
        },
        async addTask (task) {
            await this.$socket.ready()
            this.$socket.send("UpdateTask", { add: task })
            this.editingTask = null
        },
        async removeTask (task) {
            await this.$socket.ready()
            this.$socket.send("UpdateTask", { remove: task })
            this.editingTask = null
        },
        onCreateTask() {
            if (!this.canEdit) return false 
            let newTask = this.$app.methods.createTaskObject.call({ 
                app: this.$app, 
                project: this.$storage.project, 
                user: this.$storage.user 
            }, "Task")
            newTask.title = "New Task"
            newTask.description = ""
            newTask.status = null
            this.addTask(newTask)
        },
        onCreateMilestone() {
            if (!this.canEdit) return false
            let newTask = this.$app.methods.createTaskObject.call({ 
                app: this.$app, 
                project: this.$storage.project, 
                user: this.$storage.user 
            }, "Milestone")
            newTask.title = "New Milestone"
            newTask.description = ""
            this.addTask(newTask)
        },
        onCreateTaskSet() {
            if (!this.canEdit) return false
            let newTask = this.$app.methods.createTaskObject.call({ 
                app: this.$app, 
                project: this.$storage.project, 
                user: this.$storage.user 
            }, "TaskSet")
            newTask.title = "New Task Set"
            newTask.description = ""
            this.addTask(newTask)
        },
        onBeginEditTask (task) {
            if (!this.canEdit) return false 
            if (!task.id) return false
            this.editingTask = nestedClone(task)
        },
        onCompleteEditTask (confirm) {
            if (!confirm) {
                this.editingTask = null
                return
            }
            this.updateTask(this.editingTask)
        },
        onRemoveTask (confirm) {
            if (!this.canEdit) return false 
            if (!confirm) return false
            this.removeTask(this.editingTask)
        },
        resolveText (field, value) {
            let ds = this.$app.dataSources[field.dataSource]
            if (field.type == "timestamp") {
                if (days(Date.now(), this.$app.tz) == days(value, this.$app.tz)) {
                    return `${this.$locale.current.common.today} ${timestampToHHMM(value, this.$app.tz)}`
                }
                else {
                    return `${timestampToDayMonthYear(value, this.$app.tz)} ${timestampToHHMM(value, this.$app.tz)}`
                }
            }
            if (ds) {
                let item = ds.restoreItem.call({ project: this.$storage.project, user: this.$storage.user, app: this.$app }, value)
                return ds.convertItem(item)?.text
            }
            return value
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
            .filter(item=> item.type == "Task" || item.type == "Milestone")
            .sort((a, b)=> a.createdAt - b.createdAt)
        let tasksets = [
            ...(Object.values(project.data.taskObjects)
            .filter(item=> item.type == "TaskSet")
            .sort((a, b)=> a.createdAt - b.createdAt)),
            { title: "Other tasks", id: null }
        ]
        return h("div", { class: ["pad-025"], style: { "overflow-x": "hidden", "max-width": "100%" } }, [
            h("h3", { class: ["mar-b-05"] }, "Task list"),
            tasksets.map(ts=> {
                let theTasks = tasks.filter(t=> t.taskSetId == ts.id)
                return [
                    h("h3", { class: ["mar-b-05", "clickable"], onClick: ()=> this.onBeginEditTask(ts) }, [ ts.title, " ", theTasks.length? `( ${theTasks.length} )` : null ]),
                    h("div", { style: { "overflow-x": "scroll", "max-width": "100%" } }, [
                        h("div", { class: ["mar-b-05", "task-list-row", "task-list-header"] }, [
                            h("span", { class: ["task-list-cell"], style: {"width": "3.5rem", "text-align": "center"} }, ""),
                            fields.map(field=> h("b", { class: ["task-list-cell"] }, field.name)),
                            h("span", { class: ["flex-grow", "fake-task-list-cell"] }, "")
                        ]),
                        theTasks.length?
                        theTasks.map(item=> h("div", { class: ["clickable", "task-list-row"], onClick: ()=> this.onBeginEditTask(item) }, [
                            h("span", { class: ["task-list-cell"], style: {"width": "3.5rem", "text-align": "center"} }, h(resolveIcon(item.type), { class: ["icon-10", "color-gray"] })),
                            fields.map(field=> h("span", { class: ["task-list-cell"] }, this.resolveText(field, item[field.name])))
                        ])) : 
                        h("p", { class: ["pad-05-0"] }, "No tasks so far..."),
                        h("div", { class: ["mar-b-05"] })
                    ]),
                    h("div", { class: ["mar-b-1", "bb"] }, ""),
                ]
            }),
            h("div", { class: ["mar-b-1"] }, [
                h("button", { class: [], onClick: ()=> this.onCreateTask() }, "+ Create Task"), " ",
                h("button", { class: [], onClick: ()=> this.onCreateMilestone() }, "+ Create Milestone"), " ",
                h("button", { class: [], onClick: ()=> this.onCreateTaskSet() }, "+ Create Task Set")
            ]),
            this.editingTask?
            EditTaskModal(this, this.editingTask) : null
        ])
    }
}
