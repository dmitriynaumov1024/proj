import { h, createApp } from "vue"
import { installable } from "@/lib/installable.js"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

let nestedApps = { }
let sockets = { }

const WorkspaceAppTemplate = {
    data() {
        return {
            message: "Loading..."
        }
    },
    mounted() {
        this.$socket.on("ConnectOk", ()=> {
            this.message = "Connected successfully! :D"
        })
        this.$socket.on("NotAuthorized", ()=> {
            this.message = "Not authorized to connect to this project :("
        })
        this.connectToProject()
    },
    methods: {
        async connectToProject() {
            await this.$socket.ready()
            this.$socket.send({
                type: "Connect",
                data: { 
                    session: this.$http.session,
                    project: { id: this.$env.projectId }
                }
            })
        }
    },
    render() {
        return h("div", { class: ["pad-05"] }, [
            h("p", { }, "Hell to world! from nested app!"),
            h("p", { }, "status: "+this.message)
        ])
    }
}

function createSocket(id) {
    let socket = new WebSocket(`wss://${window.location.host}/`)
    let handlers = { }
    socket.addEventListener("message", (message)=> {
        let wrappedMessage = JSON.parse(message.data)
        let topicHandlers = handlers[wrappedMessage.type]
        if (topicHandlers) for (let handler of topicHandlers) {
            if (handler instanceof Function) {
                handler(wrappedMessage.data, wrappedMessage)
            }
        }
    })
    sockets[id] = socket
    let socket2 = {
        raw: socket,
        send: (wrappedMessage)=> {
            socket.send(JSON.stringify(Object.assign({ }, wrappedMessage)))
        },
        on: (type, handler)=> {
            handlers[type] ??= [ ]
            handlers[type].push(handler)
        },
        ready: ()=> new Promise((resolve, reject)=> {
            if (socket.readyState == WebSocket.CONNECTING) {
                socket.addEventListener("open", ()=> resolve())
            }
            else if (socket.readyState == WebSocket.OPEN) {
                resolve()
            }
            else {
                reject()
            }
        })
    }
    return socket2
}

function createNestedApp(id, parent) {
    if (!id) return

    let socket = createSocket(id)

    let app = createApp(WorkspaceAppTemplate)
    nestedApps[id] = app

    app.use(installable("$env", { projectId: id  }))
    app.use(installable("$socket", socket))
    app.use(installable("$http", parent.$http))
    app.use(installable("$locale", parent.$locale))
    return app
}

function disposeNestedApp(id) {
    if (!id) return
    sockets[id]?.close()
    nestedApps[id]?.unmount()
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
        const loc = this.$locale.current
        return h("div", { class: ["h100", "flex-v"] }, [
            h(HeaderLayout, { hless: true, wfull: true }, ()=> [
                h("h2", { class: ["clickable"] }, loc.workspace.self)
            ]),
            h("div", { class: ["bv", "flex-grow", "scroll"] }, [
                h("div", { ref: "nestedAppRoot", id: "nestedAppRoot" })
            ]),
            h(FooterLayout, { style: {"flex-shrink": 0}, hless: true, wfull: true })
        ])
    }
}
