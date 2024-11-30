import { h } from "vue"
import { nestedClone } from "common/utils/object"

export default {
    props: {
        parent: Object
    },
    data() {
        return {
            before: { },
            after: { },
            changed: false
        }
    },
    mounted() {
        let project = this.$storage.project
        this.before = { title: project.title, description: project.data.description }
        this.after = nestedClone(this.before)
    },
    methods: {
        async saveChanges() {
            await this.$socket.ready()
            this.$socket.send("UpdateProjectInfo", {
                project: this.after
            })
            this.changed = false
        },
        onReset() {
            this.after = nestedClone(this.before)
            this.changed = false
        },
        onSaveChanges() {
            this.saveChanges()
        }
    },
    render() {
        let loc = this.$locale.current
        return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
            h("h3", { class: ["mar-b-05"] }, "Settings"),
            h("div", { class: ["mar-b-05"] }, [
                h("p", { }, "Title"),
                h("input", { class: ["block"],
                    value: this.after.title,
                    onInput: (e)=> { this.after.title = e.target.value; this.changed = true }
                }),
            ]),
            h("div", { class: ["mar-b-05"] }, [
                h("p", { }, "Description"),
                h("textarea", { class: ["block", "height-10"],
                    value: this.after.description,
                    onInput: (e)=> { this.after.description = e.target.value; this.changed = true }
                })
            ]),
            this.changed?
            h("div", { class: ["mar-b-05", "flex-stripe", "flex-pad-05"] }, [
                h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> this.onReset() }, loc.action.reset),
                h("button", { class: ["flex-grow"], onClick: ()=> this.onSaveChanges() }, loc.action.save)
            ]) : null
        ])
    }
}
