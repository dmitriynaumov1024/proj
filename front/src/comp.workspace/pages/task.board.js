import { h } from "vue"
import Modal from "@/comp.layout/modal.js"
import Selectbox from "@/comp.ctrl/selectbox.js"
import { EditTaskModal } from "../comp/edittaskmodal.js"
import { nestedClone } from "common/utils/object"
import { timestampToHHMM, timestampToDayMonthYear, days } from "@/lib/utils.js"

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
        onCreateTask ({ status } = { }) {
            let newTask = this.$app.methods.createTaskObject.call({ 
                app: this.$app, 
                project: this.$storage.project, 
                user: this.$storage.user 
            }, "Task")
            newTask.title = "New Task"
            newTask.description = ""
            newTask.status = status || Object.keys(this.$storage.project.data.taskStatuses)[0]
            this.addTask(newTask)
        },
        resolveText (field, value) {
            let ds = this.$app.dataSources[field.dataSource]
            if (!ds) return value
            let item = ds.restoreItem.call({ project: this.$storage.project, user: this.$storage.user }, value)
            return ds.convertItem(item)?.text
        },
        formatDateTime (value) {
            if (days(Date.now(), this.$app.tz) == days(value, this.$app.tz)) {
                return `${this.$locale.current.common.today} ${timestampToHHMM(value, this.$app.tz)}`
            }
            else {
                return `${timestampToDayMonthYear(value, this.$app.tz)} ${timestampToHHMM(value, this.$app.tz)}`
            }
        },
        onBeginEditTask (task) {
            if (!this.canEdit) return false 
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
            if (!confirm) return false
            this.removeTask(this.editingTask)
        }
    },
    render() {
        let project = this.$storage.project
        let loc = this.$locale.current
        let taskFields = project.data.taskFields.Task
        let statuses = Object.entries(project.data.taskStatuses)
            .sort((a, b)=> a[1].index-b[1].index)
        let tasks = Object.values(project.data.taskObjects)
            .filter(item=> item.type == "Task")
            .sort((a, b)=> a.createdAt - b.createdAt)
        return h("div", { class: ["pad-025"], style: { "overflow-x": "hidden", "max-width": "100%" } }, [
            h("h3", { class: ["mar-b-05"] }, "Task board"),
            h("div", { style: { "overflow-x": "scroll", "max-width": "100%", "min-height": "60vh" } }, [
                h("div", { class: ["flex-stripe", "flex-pad-05", "list-row"] }, [
                    statuses.map(([status, { index, value }])=> {
                        let theTasks = tasks.filter(task=> task.status==status)
                        return h("div", { style: { width: "18rem", "overflow-x": "hidden" }, class: ["flex-noshrink"] }, [
                            h("h3", { class: ["bb", "pad-025", "mar-b-05"] }, theTasks.length? `${status} ( ${theTasks.length} )` : `${status}`),
                            theTasks.map(task=> h("div", { 
                                class: ["mar-b-05", "pad-025", "clickable"], 
                                style: { backgroundColor: "rgba(128, 128, 128, 0.1)" },
                                onClick: ()=> this.onBeginEditTask(task)
                            }, [
                                h("p", { class: ["one-line"] }, h("b", task.title)),
                                h("p", { class: ["color-gray"] }, this.formatDateTime(task.createdAt))
                            ])),
                            h("a", { class: ["block", "pad-05", "text-center", "clickable", "mar-b-1"], onClick: ()=> this.onCreateTask({ status }) }, "+ Create task")
                        ])
                    })
                ])
            ]),
            this.editingTask?
            EditTaskModal(this, this.editingTask) : null
        ])
    }
}
