import { h } from "vue"
import { RouterLink } from "vue-router"
import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

function PlaygroundView (self) {
    return h("div", { }, [
        h("div", { class: ["bv", "pad-05-0"] }, [
            h("p", { }, "Message type"),
            h("input", { class: ["block"], value: self.message.type, onChange: (e)=> self.message.type = e.target.value }),
            h("p", { }, "Message data (JSON format)"),
            h("textarea", { class: ["block", "height-10"], value: self.message.data, onChange: (e)=> self.message.data = e.target.value })
        ]),
        h("div", { class: ["bv", "pad-05-0"] }, [
            h("button", { class: ["block", "pad-05"], onClick: ()=> self.onSendMessage() }, "Send message")
        ]),
        h("div", { class: ["bv", "pad-05-0"] }, [
            h("p", { class: ["mar-b-05"] }, h("b", { }, "Log")),
            self.log.map(message=> h("div", { class: ["mar-b-05"] }, [
                h("p", { }, `${message.who} >> ${message.type}`),
                h("p", { }, (typeof message.data == "string")? message.data : JSON.stringify(message.data))
            ]))
        ])
    ])
}

export default {
    props: {
        id: String
    },
    data() {
        return {
            project: null,
            errorMessage: null,
            notAuthorized: null,
            socket: null, 
            message: { type: "", data: "" },
            log: [ ]
        }
    },
    methods: {
        onSendMessage() {
            this.socket.send(this.message)
            this.message = { type: "", data: "" }
        }
    },
    mounted() {
        let socket = new WebSocket(`wss://${window.location.host}/`)
        socket.addEventListener("message", (message)=> {
            let wrappedMessage = JSON.parse(message.data)
            this.log.push(Object.assign({ who: "server" }, wrappedMessage))
        })
        this.socket = {
            send: (wrappedMessage)=> {
                socket.send(`{ "type": "${wrappedMessage.type}", "data": ${wrappedMessage.data} }`)
                this.log.push(Object.assign({ who: "client" }, wrappedMessage))
            }
        }
    },
    render() {
        const loc = this.$locale.current
        return h("div", { class: ["h100", "flex-v"] }, [
            h(HeaderLayout, { hless: true, wfull: true }, ()=> [
                h("h2", { class: ["clickable"] }, loc.workspace.self)
            ]),
            h("div", { class: ["bv", "flex-grow", "scroll"] }, [
                h("div", { class: ["wc", "pad-05"] }, [
                    PlaygroundView(this)
                ]),
            ]),
            h(FooterLayout, { style: {"flex-shrink": 0}, hless: true, wfull: true })
        ])
    }
}
