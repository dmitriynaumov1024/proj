import { h } from "vue"
import { base32id } from "common/utils/id"
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
            changed: false,
            reordering: false,
            reordered: false,
            canEdit: false,
            deleting: false,
            toggling: false,
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
    mounted() {
        let { project, user } = this.$storage
        let perm = project.data.users[user.id]?.permission
        if (perm == PL.admin || perm == PL.owner) this.canEdit = true
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
        async saveNewPlugin(id, plugin) {
            await this.$socket.ready()
            this.$socket.send("UpdatePlugins", {
                plugins: { [id]: plugin }
            })
        },  
        async applyReorder() {
            await this.$socket.ready()
            this.$socket.send("ReorderPlugins", { reorder: this.reordering })
            this.reordering = false
        },
        async applyToggle() {
            await this.$socket.ready()
            this.$socket.send("TogglePlugins", { 
                plugins: this.$storage.project.plugins.map((p, i)=> ({ id: p.id, enabled: this.toggling[i] }))
            })
        },
        async deletePlugin(id) {
            await this.$socket.ready()
            this.$socket.send("DeletePlugin", { id })
        },
        onReset() {
            if (this.changed) {
                this.plugin2 = nestedClone(this.plugin)
                this.changed = false
            }
            else if (this.reordered) {
                this.applyReorder()
            }
        },
        onSaveChanges() {
            this.saveChanges()
        },
        onBeginReorder() {
            if (this.changed) return false
            this.reordering = Object.fromEntries(this.$storage.project.plugins.map((item, i)=> [i, i]))
            console.log("reordering")
        },
        onSwap (i1, i2) {
            if (!this.canEdit) return false
            if (i1 < 0 || i2 < 0) return false 
            let { plugins } = this.$storage.project
            if (i1 >= plugins.length || i2 >= plugins.length) return false  
            this.reordered = true
            let tmp = this.reordering[i1]
            this.reordering[i1] = this.reordering[i2]
            this.reordering[i2] = tmp
        },
        onCreatePlugin() {
            if (this.reordered) return false
            let newPlugin = { 
                id: base32id(16),
                type: "inline",
                name: "new-plugin",
                code: "console.log('hello world!')",
                enabled: true,
            }
            this.$storage.project.plugins.push(newPlugin)
            this.saveNewPlugin(this.$storage.project.plugins.length-1, newPlugin)
        },
        onBeginDeletePlugin (id) {
            this.deleting = { id } 
        },
        onCompleteDeletePlugin (confirm) {
            if (confirm) {
                this.deletePlugin(this.deleting?.id)
            }
            this.deleting = false
        },
        onBeginTogglePlugins() {
            this.toggling = this.$storage.project.plugins.map(p=> p.enabled)
        },
        onCompleteTogglePlugins(confirm) {
            if (confirm) {
                this.applyToggle()
            }
            else {
                this.toggling = false
            }
        }
    },
    render() {
        let loc = this.$locale.current
        let plugins = this.$storage.project.plugins
        if (this.plugin instanceof Object) {
            // detailed view of one plugin
            if (this.plugin.type == "inline") return h("div", { class: ["pad-025"] }, [
                h("p", { class: ["mar-b-1"] }, [
                    h("a", { onClick: ()=> this.parent.navigate(this.parent.route) }, "Plugins"), " > ",
                    h("span", { }, this.plugin.name||this.plugin.id)
                ]),
                h("div", { class: ["mar-b-1"] }, [
                    h("p", { }, "Plugin name"),
                    h("input", { class: ["block", "text-mono"],
                        readonly: !this.canEdit,
                        value: this.plugin2.name,
                        onChange: (e)=> { this.plugin2.name = e.target.value; this.changed = true }
                    })
                ]),
                h("div", { class: ["mar-b-1"] }, [
                    h("p", { }, "Code"),
                    h("textarea", { class: ["block", "text-mono", "hmin70"],
                        readonly: !this.canEdit,
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
        else if (this.reordering instanceof Object) {
            // when reordering
            return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
                h("h3", { class: ["mar-b-1"] }, "Reorder Plugins"),
                plugins.map((p, i)=> [plugins[this.reordering[i]], i, this.reordering[i]]).map(([p, iold, i])=> h("div", { class: ["flex-stripe", "flex-center"] }, [
                    h("span", { class: ["clickable", "pad-025-05"], onClick: ()=> this.onSwap(iold-1, iold) }, "\u25b2"),
                    h("span", { class: ["clickable", "pad-025-05"], onClick: ()=> this.onSwap(iold, iold+1) }, "\u25bc"),
                    h("span", { class: ["text-center", "pad-025"], style: { width: "3.5rem" } }, iold),
                    p.type=="inline"?
                    h("p", { class: ["text-mono"] }, `[inline:${p.id}] ${p.name||p.id}`) : 
                    h("p", { class: ["text-mono"] }, `[external:p.id]`)
                ])),
                h("div", { class: ["mar-b-1"] }, ""),
                h("div", { class: ["mar-b-1", "flex-stripe", "flex-pad-05", "wwc", "stick-left"] }, [
                    h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> this.onReset() }, loc.action.reset),
                    h("button", { class: ["flex-grow"], onClick: ()=> this.applyReorder() }, loc.action.save)
                ])
            ])
        }
        else if (this.toggling) {
            // when enabling-disabling plugins
            return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
                h("h3", { class: ["mar-b-1"] }, "Enable or disable Plugins"),
                plugins.map((p, i)=> h("div", { class: ["pad-05-0", "clickable"], onClick: ()=> {this.toggling[i]= !this.toggling[i]} }, [
                    h("span", { class: ["text-mono"] }, this.toggling[i]? "+ ": "- "),
                    h("span", { class: ["text-mono"] }, (p.type=="inline")? `[inline:${p.id}] ${p.name||p.id}` : `[external:p.id]`)
                ])),
                h("div", { class: ["mar-b-1"] }, ""),
                h("div", { class: ["mar-b-1", "flex-stripe", "flex-pad-05", "wwc", "stick-left"] }, [
                    h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> this.onCompleteTogglePlugins() }, loc.action.reset),
                    h("button", { class: ["flex-grow"], onClick: ()=> this.applyToggle() }, loc.action.save)
                ])
            ])
        }
        else if (this.query.id) {
            // when could not find by id
            return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
                h("a", { onClick: ()=> this.parent.navigate(this.parent.route) }, "Plugins"), " > ",
                h("span", { }, "[not found]")
            ])
        }
        else {
            // normal view of list of plugins
            return h("div", { class: ["pad-025", "wwc", "stick-left"] }, [
                h("div", { class: ["flex-stripe", "flex-pad-05", "mar-b-1"] }, [
                    h("h3", { class: ["flex-grow"] }, "Plugins"),
                    h("button", { class: [], onClick: ()=> this.onCreatePlugin() }, "+ "+loc.action.create),
                    h("button", { class: [], onClick: ()=> this.onBeginReorder() }, "< > Reorder"),
                    h("button", { class: [], onClick: ()=> this.onBeginTogglePlugins() }, "- / + Toggle")
                ]),
                plugins.map((p, i)=> h("div", { class: ["flex-stripe", "flex-center"] }, [
                    h("span", { class: ["text-mono", "flex-grow", "pad-05-0", "clickable", p.enabled?null:"color-gray"], 
                        onClick: ()=> this.parent.navigate(this.parent.route, { id: i }) },
                        p.type=="inline"? `[inline:${p.id}] ${p.name||p.id}` : `[external:${p.id}]`
                    ),
                    h("span", { class: ["pad-05", "clickable", "color-bad"], onClick: ()=> this.onBeginDeletePlugin(i) }, "\u2a2f")
                ])),
                this.deleting?
                h(Modal, { titleText: "Delete plugin", onClickOutside: ()=> this.onCompleteDeletePlugin(false) }, ()=> [
                    h("p", { class: ["mar-b-1"] }, "Do you really wish to delete plugin? This action can not be undone."),
                    h("p", { class: ["text-mono", "mar-b-1"] }, plugins[this.deleting.id]?.id),
                    h("div", { class: ["flex-stripe", "flex-pad-05"] }, [
                        h("button", { class: ["flex-grow"], onClick: ()=> this.onCompleteDeletePlugin(false) }, loc.action.cancel),
                        h("button", { class: ["flex-grow", "color-bad"], onClick: ()=> this.onCompleteDeletePlugin(true) }, h("b", { }, loc.action.delete))
                    ])
                ]) : null
            ])
        }
    }
}
