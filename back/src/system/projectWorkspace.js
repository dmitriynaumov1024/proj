import { SystemUnit } from "./__base.js"
import { base32id, base16id } from "common/utils/id"
import { filterFields } from "common/utils/object"
import { PermissionLevel as PL, InvolvementStatus as IS } from "../database/enums.js"

function sendObject (connection, obj) {
    connection.send(JSON.stringify(obj))
}

export class ProjectWorkspace extends SystemUnit 
{
    constructor (options) {
        super(options)
        this.events.on("attachSockets", ()=> this.configureSockets())
    }

    configureSockets () {
        let { logger, sockets } = this.infrastructure
        logger.log("Using sockets")
        sockets.server.on("connection", (connection)=> this.onRawConnect(connection))
        let handlerNames = Object.getOwnPropertyNames(this.constructor.prototype)
                                 .filter(name=> name.startsWith("onWsp"))
        for (let name of handlerNames) {
            logger.debug("wsp: using handler " + name)
            this.events.on("wsp:"+name.slice(5), (...args)=> this[name](...args))
        }
    }

    /*
    assume connection = websocket connection
    */
    onRawConnect (connection) {
        let { sockets, logger } = this.infrastructure
        logger.log("wsp: new connection")
        sockets.connections ??= [ ]
        let wrapper = ({ 
            id: base32id(20),
            raw: connection,
            send (type, data) {
                this.raw.send(JSON.stringify({
                    type, data,
                    requestId: this.requestId,
                    timestamp: Date.now()
                }))
            }
        })
        sockets.connections.push(wrapper)
        connection.on("close", ()=> {
            logger.log("wsp: someone disconnected")
            this.events.emit("wsConnectionClosed", wrapper)
        })
        connection.on("message", (data)=> {
            let parsedMessage = this.parseWsMessage(data, wrapper)
            logger.debug("wsp: "+parsedMessage.type)
            this.events.emit("wsp:"+parsedMessage.type, parsedMessage.data, Object.assign({ requestId: parsedMessage.requestId, set: (key, value)=> { wrapper[key] = value } }, wrapper))
        })
    }

    parseWsMessage (data, connWrapper) {
        try {
            let result = JSON.parse(data)
            if (!result.type) result.type = "TypelessMessage"
            return result
        }
        catch (error) {
            return { type: "BadMessage", data: data }
        }
    }

    /*
    assume session = { id, token }, project = { id }  
    */
    async onWspConnect ({ session, project }, context) {
        let user = await this.parent.auth.getUser({ session, wholeUser: true })
        if (!user) {
            context.send("NotAuthorized", { })
        }
        user = filterFields(user, ["id", "displayName", "userName", "email"])
        context.set("user", user)
        context.send("ConnectOk", { user })
    }

    onWspTypelessMessage (data) {
        let { logger } = this.infrastructure
        logger.debug("wsp: typeless message")
    }

    onWspBadMessage (data) {
        let { logger } = this.infrastructure
        logger.debug("wsp: bad message")
    }

    onWspPing (data, context) {
        let { logger } = this.infrastructure
        context.send("Pong", "pong!")
        logger.log("wsp: someone pinged")
    }

    onWspEchoPlease (data, context) {
        let { logger } = this.infrastructure
        context.send("Echo", data)
        logger.log("wsp: echo")
    }
}
