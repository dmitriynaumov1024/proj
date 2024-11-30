import { h } from "vue"
import { nestedClone } from "common/utils/object"
import { PermissionLevel as PL, FundamentalTaskStatusOrder as FTSOrder } from "common/wsp/enums"
import Modal from "@/comp.layout/modal.js"

export default {
    props: {
        parent: Object,
        query: Object
    },
    data() {
        return {
            plugin: null,
            plugin2: null,
            changed: false
        }
    },
    watch: {
        "query.id": {
            immediate: true,
            handler (id) {
                let plugins = this.$storage.project.plugins
                this.plugin = plugins[id]
                this.changed = false
                if (this.plugin) this.plugin2 = nestedClone(this.plugin)
            }
        }
    },
    methods: {
        async saveChanges() {
            await this.$socket.ready()
            let result = {
                plugins: { [this.query.id]: this.plugin2 }
            }
            console.log(result)
            this.$socket.send("UpdatePlugins", result)
        },
        onReset() {
            this.plugin2 = nestedClone(this.plugin)
            this.changed = false
        },
        onSaveChanges() {
            this.saveChanges()
        },
        onCreatePlugin() {
            this.$storage.plugins.push({ })
            this.parent.navigate(this.parent.route, { id: this.$storage.length-1 })
        }
    },
    render() {
        let loc = this.$locale.current
        let plugins = this.$storage.project.plugins
        if (this.plugin) {
            if (this.plugin.type == "inline") return h("div", { class: ["pad-025"] }, [
                h("p", { class: ["mar-b-1"] }, [
                    h("a", { onClick: ()=> this.parent.navigate(this.parent.route) }, "Plugins"), " > ",
                    h("span", { }, "inline plugin")
                ]),
                h("div", { class: ["mar-b-1"] }, [
                    h("p", { }, "Plugin id"),
                    h("input", { class: ["block", "text-mono"],
                        value: this.plugin2.id,
                        onChange: (e)=> { this.plugin2.id = e.target.value; this.changed = true }
                    })
                ]),
                h("div", { class: ["mar-b-1"] }, [
                    h("p", { }, "Code"),
                    h("textarea", { class: ["block", "text-mono", "hmin70"],
                        value: this.plugin2.code,
                        onChange: (e)=> { this.plugin2.code = e.target.value; this.changed = true }
                    })
                ]),
                this.changed?
                h("div", { class: ["mar-b-1", "flex-stripe", "flex-pad-05", "wwc", "stick-left"] }, [
                    h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> this.onReset() }, loc.action.reset),
                    h("button", { class: ["flex-grow"], onClick: ()=> this.onSaveChanges() }, loc.action.save)
                ]) : null
            ])
            else return h("div", { class: ["pad-025"] }, [
                h("p", { class: ["mar-b-1"] }, [
                    h("a", { onClick: ()=> this.parent.navigate(this.parent.route) }, "Plugins"), " > ",
                    h("span", { }, this.plugin.pluginId), " > ",
                    h("span", { }, this.plugin.version)
                ]),
                h("p", { class: ["mar-b-1"] }, [
                    "Code preview for external plugins not available yet."
                ])
            ])
        }
        else if (this.query.id) {
            return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
                h("a", { onClick: ()=> this.parent.navigate(this.parent.route) }, "Plugins"), " > ",
                h("span", { }, "[not found]")
            ])
        }
        else {
            return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
                h("div", { class: ["flex-stripe", "flex-pad-05", "mar-b-1"] }, [
                    h("h3", { class: ["flex-grow"] }, "Plugins"),
                    h("button", { class: [], onClick: ()=> this.onCreatePlugin() }, "+ "+loc.action.create)
                ]),
                plugins.map((p, i)=> h("div", { class: ["pad-05-0", "clickable"], onClick: ()=> this.parent.navigate(this.parent.route, { id: i }) }, [
                    p.type=="inline"?
                    h("p", { }, "[inline] "+(p.id||"")) : 
                    h("p", { }, p.id)
                ]))
            ])
        }
    }
}
