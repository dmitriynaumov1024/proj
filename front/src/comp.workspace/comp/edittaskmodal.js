import { h } from "vue"
import Modal from "@/comp.layout/modal.js"
import Selectbox from "@/comp.ctrl/selectbox.js"
import Checkbox from "@/comp.ctrl/checkbox.js"
import Timestampbox from "@/comp.ctrl/timestampbox.js"

function getItemText (item) {
    return item?.text ?? item?.value ?? item
}

/*
how to input??
if it has datasource:
    if editable, we make selectbox,
    else we make non-editable input.
else if it is enum:
    if editable, we make selectbox,
    else we make non-editable input.
else:
    if it is boolean, we make checkbox.
    else if it is number, we make number input.
    else if it is timestamp, we make timestamp input.
    else if it is string and max > 100: we make textarea.
    else we make input.
*/
export function EditTaskModal (self, task) {
    const loc = self.$locale.current
    const { project, user } = self.$storage
    const fields = Object.values(project.data.taskFields[task.type].primary)
    const dataSources = self.$app.dataSources
    return h(Modal, { titleText: `Edit ${task.type}`, onClickOutside: ()=> self.onCompleteEditTask(false) }, ()=> [
        h("div", { style: { "max-height": "50vh", "padding-right": "0.5rem" }, class: ["scroll"] }, [
            fields.map(field=> {
                let input = null
                let ds = dataSources[field.dataSource]
                if (ds) {
                    console.log(ds)
                    if (field.editable) input = h(Selectbox, { class: ["block"],
                        value: task[field.name],
                        onChange: (value)=> task[field.name] = value,
                        items: ds.getItems.call({ project, user, app: self.$app })
                        .map(ds.convertItem)
                    })
                    else input = h("input", { class: ["block"],
                        readonly: true,
                        value: getItemText(ds.convertItem(
                            ds.restoreItem.call({ project, user, app: self.$app }, task[field.name])
                        ))
                    })
                }
                else if (field.type == "enum") {
                    if (field.editable) input = h(Selectbox, { class: ["block"],
                        value: task[field.name],
                        onChange: (value)=> task[field.name] = value,
                        items: field.values.map(item=> ({ text: item, value: item }))
                    })
                    else input = h("input", {class: ["block"],
                        readonly: true,
                        value: task[field.name]                        
                    })
                }
                else if (field.type == "boolean") {
                    input = h(Checkbox, { 
                        disabled: !field.editable, 
                        value: task[field.name], 
                        onChange: (value)=> task[field.name] = value 
                    }, ()=> task[field.name]? "true":"false")
                }
                else if (field.type == "number") {
                    input = h("input", { class: ["block"],
                        readonly: !field.editable,
                        value: task[field.name],
                        onChange: (e)=> task[field.name] = Number(event.target.value)
                    })
                }
                else if (field.type == "timestamp") {
                    input = h(Timestampbox, {
                        disabled: !field.editable,
                        timezone: self.$app.tz,
                        value: task[field.name],
                        onChange: (value)=> task[field.name] = value 
                    })
                }
                else if (field.type == "string" && field.max > 100) {
                    input = h("textarea", { class: ["block", "height-5"],
                        readonly: !field.editable,
                        value: task[field.name],
                        onChange: (e)=> task[field.name] = event.target.value
                    })
                } 
                else {
                    input = h("input", { class: ["block"],
                        readonly: !field.editable,
                        value: task[field.name],
                        onChange: (e)=> task[field.name] = event.target.value
                    })
                }
                return h("div", { class: ["mar-b-05"] }, [
                    h("p", { }, field.name),
                    input
                ])
            })
        ]),
        h("div", { class: ["pad-05-0"] }, [
            h("a", { class: ["color-bad"], onClick: ()=> self.onRemoveTask(task) }, `Delete ${task.type}`),
        ]),
        h("div", { class: ["flex-stripe", "flex-pad-05"] }, [
            h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> self.onCompleteEditTask(false) }, loc.action.cancel),
            h("button", { class: ["flex-grow"], onClick: ()=> self.onCompleteEditTask(true) }, loc.action.save)
        ])
    ])
}