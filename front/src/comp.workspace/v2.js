import { h, createApp, markRaw as m } from "vue"
import { installable } from "@/lib/installable.js"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.wsp.js"

import { createSocket } from "@/lib/socket.js"
import { createTempStorage } from "@/lib/storage.js"
import { nestedAssign } from "common/utils/object"

import * as ico from "@/comp.icon/index.js"
import Menu from "./comp/menu.js"

import pages from "./pages/index.js"

const defaultRoute = "index"
const notFoundRoute = "notFound"

const WorkspaceAppMenu = [
    {
        name: "Tasks",
        items: [
            { name: "Task list", icon: m(ico.TaskListIcon), route: "tasklist" },
            { name: "Task board", icon: m(ico.TaskBoardIcon), route: "taskboard" },
        ]
    },
    {
        name: "Collaboration",
        items: [
            { name: "Users", icon: m(ico.PersonIcon), route: "users" },
            { name: "Groups", icon: m(ico.PersonGroupIcon), route: "groups" }
        ]
    },
    {
        name: "Settings",
        items: [
            { name: "Project settings", icon: m(ico.Gear6Icon), route: "settings.project" },
            { name: "Task fields", icon: m(ico.TaskIcon), route: "settings.taskfields"  },
            { name: "Task states", icon: m(ico.ActivityIcon), route: "settings.taskstatus" },
        ]
    }
]

const WorkspaceAppPages = {
    [defaultRoute]: m(pages.default),
    [notFoundRoute]: m(pages.notfound),
    "users": m(pages.users),
    "settings.project": m(pages.settings.project),
}

const WorkspaceAppTemplate = {
    data() {
        return {
            connection: {
                ok: false,
                error: true,
                message: null
            },
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
        },
        setupApp() {
            let app = this.$app
            // set up app menu
            app.menu = WorkspaceAppMenu
            // set up app pages
            app.pages = Object.assign({ }, WorkspaceAppPages)
            app.ready = true
        },
        async connectToProject() {
            await this.$socket.ready()
            this.$socket.on("Project.Data", (data)=> {
                this.$storage.project = data
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
