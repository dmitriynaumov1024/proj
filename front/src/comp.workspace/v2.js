import { h, createApp } from "vue"
import { installable } from "@/lib/installable.js"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.wsp.js"

import { createSocket } from "@/lib/socket.js"
import { createTempStorage } from "@/lib/storage.js"

import * as ico from "@/comp.icon/index.js"
import Menu from "./ctrl/menu.js"

const defaultRoute = "index"
const notFoundRoute = "notFound"

const WorkspaceAppTemplate = {
    data() {
        return {
            connection: {
                ok: false,
                error: true,
                message: null
            },
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
        },
        setupApp() {
            let app = this.$app
            // set up app menu
            app.menu = [
                {
                    name: "View",
                    items: [
                        { name: "Task list", icon: ico.TaskListIcon },
                        { name: "Task board", icon: ico.TaskBoardIcon }
                    ]
                },
                {
                    name: "Settings",
                    items: [
                        { name: "Project settings", icon: ico.Gear6Icon }
                    ]
                }
            ]
            // set up app pages
            app.pages = {
                [defaultRoute]: ({ parent })=> {
                    let self = parent
                    return h("div", { class: ["pad-025"] }, [
                        h("h3", { class: ["mar-b-05"] }, "Index page"),
                        h("p", h("a", { onClick: ()=> self.navigate("some not existent route") }, "Go to some not existent route >>")),
                    ])
                },
                [notFoundRoute]: ({ parent })=> {
                    let self = parent
                    let loc = self.$locale.current 
                    return h("div", { class: ["pad-025"] }, [
                        h("h3", { class: ["mar-b-05"] }, "Error"),
                        h("p", { }, loc.error.notFound),
                        h("p", h("a", { onClick: ()=> self.navigate(defaultRoute) }, "<< Back to index page"))
                    ])
                }
            }
            app.ready = true
        },
        async connectToProject() {
            await this.$socket.ready()
            this.$socket.on("Project.Data", (data)=> {
                this.$storage.project = data
            })
            this.$socket.send("Connect", { 
                session: this.$http.session,
                project: { id: this.$env.projectId }
            })
        },
        navigate (route, query) {
            this.route = route
            this.query = query?? { }
        }
    },
    render() {
        const loc = this.$locale.current
        const connection = this.connection
        const project = this.$storage.project
        const app = this.$app
        return h("div", { class: ["h100", "flex-v"] }, [
            h(HeaderLayout, { hless: true, wfull: true, style: {"flex-shrink": 0} }, ()=> [
                h("h2", { class: ["clickable"], onClick: ()=> this.beginRenameProject() }, project?.title ?? loc.workspace.self)
            ]),
            h("div", { class: ["bv", "flex-grow", "scroll"] }, [
                connection.ok?
                h("div", { class: ["flex-stripe", "h100"] }, [
                    app.ready? [
                        h(Menu, { items: app.menu }),
                        h("div", { class: ["wsp-main", "pad-05"] }, [
                            h(app.pages[this.route]?? app.pages[notFoundRoute], { parent: this })
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
