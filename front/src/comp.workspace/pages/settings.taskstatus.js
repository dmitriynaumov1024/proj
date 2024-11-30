import { h } from "vue"
import { nestedClone } from "common/utils/object"
import { PermissionLevel as PL, FundamentalTaskStatusOrder as FTSOrder } from "common/wsp/enums"
import Modal from "@/comp.layout/modal.js"

export default {
    props: {
        parent: Object
    },
    data() {
        return {
            before: [ ],
            after: [ ],
            changed: false,
            canEdit: false,
            editingItem: null,
        }
    },
    mounted() {
        let { project, user } = this.$storage
        this.before = Object.entries(project.data.taskStatuses).sort((a, b)=> a[1].index - b[1].index)
        this.after = this.before.map(([i0, i1])=> [i0, nestedClone(i1)])
        let perm = project.data.users[user.id]?.permission
        if (perm == PL.admin || perm == PL.owner) this.canEdit = true
    },
    methods: {
        async saveChanges() {
            if (!this.canEdit) return false
            let result = Object.fromEntries(this.after)
            console.log(result)
            await this.$socket.ready()
            this.$socket.send("UpdateProjectTaskStatuses", {
                taskStatuses: result
            })
            this.changed = false
        },
        onReset() {
            this.after = this.before.map(([i0, i1])=> [i0, nestedClone(i1)])
            this.changed = false
        },
        onSaveChanges() {
            this.saveChanges()
        },
        onBeginEdit(item) {
            if (!this.canEdit) return false
            this.editingItem = item
        },
        onCompleteEdit() {
            this.changed = true
            this.editingItem = null
        },
        onSwap (index1, index2) {
            if (!this.canEdit) return false
            if (index1 < 0 || index2 < 0) return false 
            if (index1 >= this.after.length || index2 >= this.after.length) return false  
            this.changed = true
            this.after[index1][1].index = index2
            this.after[index2][1].index = index1
            let tmp = this.after[index1]
            this.after[index1] = this.after[index2]
            this.after[index2] = tmp
        },
        onAddStatus () {
            this.changed = true
            this.after.push(["new status", { index: this.after.length, value: FTSOrder[0] }])
        },
        onRemoveStatus (item) {
            this.changed = true
            this.editingItem = null
            this.after = this.after.filter(i=> i!=item)
                .map((i, index)=> [i[0], { index, value: i[1].value }])
        }
    },
    render() {
        let loc = this.$locale.current
        return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
            h("div", { class: ["bv"] }, [
                h("div", { class: ["flex-stripe", "mar-b-05"] }, [
                    h("h3", { class: ["flex-grow"] }, "Task states"),
                    this.canEdit? h("button", { onClick: ()=> this.onAddStatus() }, "+ "+loc.action.create) : null
                ])
            ]),
            h("div", { class: ["pad-05-0", "flex-stripe", "bv"] }, [
                h("span", { style: { width: "18%", "min-wdth": "4rem" } }, ""),
                h("span", { style: { width: "40%" } }, h("b", "Status name")),
                h("span", { style: { width: "40%" } }, h("b", "Fundamental status"))
            ]),
            this.after.map((item, index)=> h("div", { class: ["pad-05-0", "flex-stripe", "bv", "clickable"] }, [
                h("span", { style: { width: "4.5%", "min-width": "1rem", }, class: ["clickable", "text-center"], 
                    onClick: ()=> this.onSwap(index, index-1) }, "\u25b2"),
                h("span", { style: { width: "4.5%", "min-width": "1rem", }, class: ["clickable", "text-center"],
                    onClick: ()=> this.onSwap(index, index+1) }, "\u25bc"),
                h("span", { style: { width: "9%", "min-width": "2rem" }, class: ["text-center"] }, item[1].index),
                h("span", { style: { "width": "40%" }, onClick: ()=> this.onBeginEdit(item) }, item[0]),
                h("span", { style: { "width": "40%" }, onClick: ()=> this.onBeginEdit(item) }, item[1].value)
            ])),
            h("div", { class: ["mar-b-1", "bv"] }, ""),
            (this.canEdit && this.changed)?
            h("div", { class: ["mar-b-05", "flex-stripe", "flex-pad-05"] }, [
                h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> this.onReset() }, loc.action.reset),
                h("button", { class: ["flex-grow"], onClick: ()=> this.onSaveChanges() }, loc.action.save)
            ]) : null,
            this.editingItem?
            h(Modal, { titleText: loc.action.edit, onClickOutside: ()=> this.onCompleteEdit() }, ()=> [
                h("div", { class: ["mar-b-05"] }, [
                    h("p", { }, "Status name"),
                    h("input", { class: ["block"], value: this.editingItem[0], onChange: (e)=> this.editingItem[0] = e.target.value })
                ]),
                h("div", { class: ["mar-b-05"] }, [
                    h("p", { }, "Fundamental status"), 
                    FTSOrder.map(fts=> h("p", { class: ["clickable"], onClick: ()=> this.editingItem[1].value=fts }, this.editingItem[1].value==fts? h("b", fts) : h("span", fts)))
                ]),
                h("button", { class: ["block", "pad-025", "mar-b-05"], onClick: ()=> this.onCompleteEdit() }, loc.action.proceed),
                h("a", { class: ["text-center", "color-bad", "pad-025", "clickable", "block"], onClick: ()=> this.onRemoveStatus(this.editingItem) }, loc.action.delete)
            ]) : null
        ])
    }
}
