import { h } from "vue"
import { nestedClone } from "common/utils/object"
import { PermissionLevel as PL } from "common/wsp/enums"

export default {
    props: {
        parent: Object
    },
    data() {
        return {
            before: { },
            after: { },
            changed: false,
            canEdit: false
        }
    },
    mounted() {
        let { project, user } = this.$storage
        this.before = { title: project.title, description: project.data.description }
        this.after = nestedClone(this.before)
        let perm = project.data.users[user.id]?.permission
        if (perm == PL.admin || perm == PL.owner) this.canEdit = true
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
                    readonly: !this.canEdit,
                    value: this.after.title,
                    onInput: (e)=> { this.after.title = e.target.value; this.changed = true }
                }),
            ]),
            h("div", { class: ["mar-b-05"] }, [
                h("p", { }, "Description"),
                h("textarea", { class: ["block", "height-10"],
                    readonly: !this.canEdit,
                    value: this.after.description,
                    onInput: (e)=> { this.after.description = e.target.value; this.changed = true }
                })
            ]),
            (this.changed && this.canEdit)?
            h("div", { class: ["mar-b-05", "flex-stripe", "flex-pad-05"] }, [
                h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> this.onReset() }, loc.action.reset),
                h("button", { class: ["flex-grow"], onClick: ()=> this.onSaveChanges() }, loc.action.save)
            ]) : null
        ])
    }
}
