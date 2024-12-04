import { h, createApp, markRaw as m } from "vue"
import { installable } from "@/lib/installable.js"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.wsp.js"

import { createSocket } from "@/lib/socket.js"
import { createTempStorage } from "@/lib/storage.js"
import { nestedAssign } from "common/utils/object"
import { base16id } from "common/utils/id"
import { TaskObjectType as TOType } from "common/wsp/enums"

import * as ico from "@/comp.icon/index.js"
import Menu from "./comp/menu.js"

import pages from "./pages/index.js"

const defaultRoute = "index"
const notFoundRoute = "notFound"

import WorkspaceApp from "./logic/workspace-app.js"

import * as $vue from "vue"

const WorkspaceAppTemplate = {
    data() {
        return {
            connection: {
                ok: false,
                error: true,
                message: null
            },
            needsRestart: false,
            activeMenuItem: null,
            expandMenu: false,
            route: defaultRoute,
            query: { }
        }
    },
    mounted() {
        this.setupConnectionHandlers()
        this.connectToProject()
    },
    methods: {
        setupConnectionHandlers() {
            let socket = this.$socket
            socket.on("Connect.Ok", ()=> {
                this.connection.ok = true
                this.connection.message = "Connected successfully! :D"
                this.setupApp()
            })
            socket.on("Connect.NotAuthorized", ()=> {
                this.connection.error = true
                this.connection.message = "Not authorized to connect to this project :("
            })
            socket.on("Connect.NotFound", ()=> {
                this.connection.error = true
                this.connection.message = "Project does not exist :("
            })
            socket.on("Connect.Forbidden", ()=> {
                this.connection.error = true
                this.connection.message = "Either banned from project or project does not allow public read."
            })
            socket.on("Connect.NeedsRestart", () => {
                this.needsRestart = true
            })
        },
        setupApp() {
            let app = this.$app
            // set up app menu
            app.menu = WorkspaceApp.menu()
            // set up app pages
            app.pages = WorkspaceApp.pages()
            // set up methods
            app.methods = WorkspaceApp.methods()
            // set up data sources
            app.dataSources = WorkspaceApp.dataSources()
            // other stuff
            app.navigate = m((route, query)=> this.navigate(route, query))
            app.ready = true
        },
        async createPlugins() {
            console.log("creating plugins...")
            let theImports = {
                vue: $vue,
                // add more imports here if necessary
            }
            let theRequire = (name)=> {
                if (Object.hasOwn(theImports, name)) return theImports[name]
                else throw new Error(`require(): could not find import '${name}'`)
            }
            this.$storage.plugins ??= [ ]
            for (let plugin of this.$storage.project.plugins) {
                if (!plugin.enabled) continue
                let theExports = { }
                let code = "let { require, imports, exports } = options;\n" + await this.getPluginCode(plugin) 
                try {
                    let pluginFactory = new Function("options", code)
                    pluginFactory({ 
                        require: (name)=> theImports[name], 
                        imports: theImports,
                        exports: theExports
                    })
                    theImports[plugin.name] = theExports.default
                    this.$storage.plugins.push(theExports.default || { })
                }
                catch (error) {
                    console.error(`Failed to create plugin '${plugin.name||plugin.id}'`)
                    console.error(error)
                }
            }
        },
        async installPlugins() {
            console.log("installing plugins...")
            let theApp = {
                ...this.$app,
                storage: this.$storage,
                locale: this.$locale,
                socket: this.$socket,
                http: this.$http
            }
            for (let plugin of this.$storage.plugins) {
                if (plugin?.install instanceof Function) await plugin.install(theApp)
            }
        },
        async mountPlugins() {
            console.log("mounting plugins...")
            let theApp = {
                ...this.$app,
                storage: this.$storage,
                locale: this.$locale,
                socket: this.$socket,
                http: this.$http
            }
            for (let plugin of this.$storage.plugins) {
                if (plugin?.mount instanceof Function) await plugin.mount(theApp)
            }
        },
        async getPluginCode (plugin) {
            if (plugin.type == "inline") {
                console.log("loading inline plugin ok")
                return plugin.code
            }
            else {
                console.warn("loading external plugins not impl. yet")
                return ""
            }
        },
        async connectToProject() {
            await this.$socket.ready()
            this.$socket.on("Project.Data", async (data)=> {
                this.$storage.project = data
                window.getProject = ()=> this.$storage.project
                await this.createPlugins()
                await this.installPlugins()
                await this.mountPlugins()
            })
            this.$socket.on("Project.DataPatch", (data)=> {
                nestedAssign(this.$storage.project, data)
            })
            this.$socket.on("User.Data", (data)=> {
                this.$storage.user = data.user
            })
            this.$socket.send("Connect", { 
                session: this.$http.session,
                project: { id: this.$env.projectId }
            })
        },
        navigate (route, query) {
            this.route = route
            this.query = query?? { }
        },
        onMenuClick (item) {
            this.activeMenuItem = item
            this.expandMenu = false
            this.route = item?.route
            this.query = item?.query?? { }
        }
    },
    render() {
        const loc = this.$locale.current
        const connection = this.connection
        const project = this.$storage.project
        const app = this.$app
        return h("div", { class: ["h100", "flex-v"] }, [
            h(HeaderLayout, { hless: true, wfull: true, style: {"flex-shrink": 0} }, ()=> [
                h("div", { class: ["clickable"], active: this.expandMenu, role: "wsp-menu-handle", onClick: ()=> this.expandMenu = !this.expandMenu }, [
                    h(ico.MenuHandleIcon, { class: ["icon-20"] })
                ]),
                h("h2", { class: ["clickable"], onClick: ()=> this.navigate(defaultRoute) }, project?.title ?? loc.workspace.self)
            ]),
            h("div", { class: ["bv", "flex-grow", "scroll"] }, [
                connection.ok?
                h("div", { class: ["flex-stripe", "h100"] }, [
                    app.ready? [
                        h(Menu, { expand: this.expandMenu, items: app.menu, activeItem: (item)=> (this.route == item.route), onClick: (item)=> this.onMenuClick(item) }),
                        h("div", { class: ["wsp-main", "pad-05"] }, [
                            this.needsRestart?
                            h("p", { class: ["mar-b-1", "pad-025", "bb"] }, [
                                "Project workspace needs to be reloaded to sync changes. ", 
                                h("a", { class: ["color-bad"], onClick: ()=> this.$reload() }, "Reload")
                            ]) : null,
                            h(app.pages[this.route]?? app.pages[notFoundRoute], { parent: this, query: this.query })
                        ])
                    ] : h("p", { }, "Preparing app UI...")
                ]) :
                connection.error?
                h("p", { class: ["color-bad"] }, connection.message) :
                h("p", { }, "Connecting to workspace, please wait...")
            ]),
            h(FooterLayout, { style: {"flex-shrink": 0}, hless: true, wfull: true })
        ])
    }
}

let nestedApps = { }
function createNestedApp(id, parent) {
    if (!id) return

    let socket = createSocket(id)

    let app = createApp(WorkspaceAppTemplate)
    nestedApps[id] = app

    let appStorage = createTempStorage("app")
    let storage = createTempStorage("project")

    app.use(installable("$env", { projectId: id  }))
    app.use(installable("$socket", socket))
    app.use(installable("$http", parent.$http))
    app.use(installable("$locale", parent.$locale))
    app.use(installable("$app", appStorage))
    app.use(installable("$storage", storage))
    app.use(installable("$reload", ()=> parent.onSwitchWorkspace(id, id) ))
    return app
}

function disposeNestedApp(id) {
    if (!id) return
    nestedApps[id]?.unmount()
    delete nestedApps[id]
}

export default {
    props: {
        id: String
    },
    watch: {
        id (newValue, oldValue) {
            if (oldValue && (newValue != oldValue)) {
                this.onSwitchWorkspace(newValue, oldValue)
            }
        }
    },
    methods: {
        onSwitchWorkspace(id, old) {
            if (!!old) disposeNestedApp(old)
            let app = createNestedApp(id, this)
            app.mount(this.$refs.nestedAppRoot)
        }
    },
    mounted() {
        this.onSwitchWorkspace(this.id)
    },
    render() {
        return h("div", { class: ["h100"], ref: "nestedAppRoot" }) 
    }
}
