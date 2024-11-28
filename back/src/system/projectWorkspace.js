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
        this.services.cache.project ??= new Map()
        this.events.on("attachSockets", ()=> this.configureSockets())
    }

    configureSockets () {
        let { logger, sockets } = this.infrastructure
        logger.log("Using sockets")
        sockets.server.on("connection", (connection)=> this.onRawConnect(connection))
        const wspHandlerPrefix = "onWsp"
        let handlerNames = Object.getOwnPropertyNames(this.constructor.prototype)
                                 .filter(name=> name.startsWith(wspHandlerPrefix))
        for (let name of handlerNames) {
            logger.debug("wsp: using handler " + name)
            this.events.on("wsp:"+name.slice(wspHandlerPrefix.length), (...args)=> this[name](...args))
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
            data: { },
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
            this.events.emit("wsp:"+parsedMessage.type, parsedMessage.data, Object.assign({ requestId: parsedMessage.requestId }, wrapper))
        })
    }

    /*
    assume data = String 
    */
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
        // validate request
        let requestOk = session?.id && session?.token && project?.id
        if (!requestOk) {
            return context.send("Connect.BadRequest", { })
        }

        // get user by session
        let user = await this.parent.auth.getUser({ session, wholeUser: true })
        if (!user) {
            return context.send("Connect.NotAuthorized", { })
        }

        // init user. later we can just check context.user without having to query database.
        user = filterFields(user, ["id", "displayName", "userName", "email"])
        context.data.user = user

        // get project
        let { cache, database } = this.services
        let theProject = cache.project.get(project.id)
        if (!theProject) {
            theProject = await database.projectInfo.query()
                .withGraphFetched("project")
                .where("id", project.id).first()
            if (!theProject) {
                return context.send("Connect.NotFound", { project })
            }
            cache.project.set(project.id, theProject)
        }

        // get project involvement
        if (!context.data.involvement) {
            context.data.involvement = await database.projectInvolvement.query()
                .where("projectId", project.id)
                .where("receiverId", user.id)
                .first()
            if (!context.data.involvement && theProject.publicRead) {
                context.data.involvement = { permission: PL.view }
            }
        }
        if (!context.data.involvement || context.data.involvement.permission == PL.none) {
            return context.send("Connect.Forbidden", { })
        }

        context.send("Connect.Ok", { user })
        return context.send("Project.Data", {
            id: theProject.id,
            title: theProject.title,
            data: theProject.project.data,
            plugins: theProject.project.plugins,
            // we don't send history here
        })
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
