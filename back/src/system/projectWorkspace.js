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
        this.registerWspHandlers()
        this.registerSystemHandlers()
    }

    configureSockets () {
        let { logger, sockets } = this.services
        logger.log("Using sockets")
        sockets.server.on("connection", (connection)=> this.onRawConnect(connection))
    }

    registerWspHandlers () {
        let { logger, sockets } = this.services
        const wspHandlerPrefix = "onWsp"
        const wspEventPrefix = "wsp:"
        let handlerNames = Object.getOwnPropertyNames(this.constructor.prototype)
                                 .filter(name=> name.startsWith(wspHandlerPrefix))
        for (let name of handlerNames) {
            logger.debug("wsp: using handler " + name)
            this.events.on(wspEventPrefix+name.slice(wspHandlerPrefix.length), (...args)=> this[name](...args))
        }
    }

    registerSystemHandlers () {
        const systemHandlerPrefix = "onSystem"
        const systemEventPrefix = "system:"
        let handlerNames = Object.getOwnPropertyNames(this.constructor.prototype)
                                 .filter(name=> name.startsWith(systemHandlerPrefix))
        for (let name of handlerNames) {
            this.events.on(systemEventPrefix+name.slice(systemHandlerPrefix.length), (...args)=> this[name](...args))
        }
    }

    /*
    assume connection = websocket connection
    */
    onRawConnect (connection) {
        let { sockets, logger } = this.infrastructure
        logger.log("wsp: new connection")
        sockets.connections ??= new Map()
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
        sockets.connections.set(wrapper.id, wrapper)
        connection.on("close", ()=> {
            logger.log("wsp: someone disconnected")
            this.events.emit("wsConnectionClosed", wrapper)
            sockets.connections.delete(wrapper.id)
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
            this.events.emit("system:SyncProjectUsers", { project: { id: theProject.id } })
        }

        // get project involvement
        if (!context.data.involvement) {
            context.data.involvement = await database.projectInvolvement.query()
                .where("projectId", project.id)
                .where("receiverId", user.id)
                .first()
            if (!context.data.involvement && theProject.publicRead) {
                context.data.involvement = { projectId: theProject.id, permission: PL.view }
            }
        }
        if (!context.data.involvement || context.data.involvement.permission == PL.none) {
            return context.send("Connect.Forbidden", { })
        }

        context.data.project = { id: theProject.id }

        context.send("Connect.Ok", { })

        context.send("User.Data", { user })

        return context.send("Project.Data", {
            id: theProject.id,
            title: theProject.title,
            data: theProject.project.data,
            plugins: theProject.project.plugins,
            // we don't send history here
        })
    }

    /*
    update project info like title and description.
    assume request project = { title, description }
    */
    async onWspUpdateProjectInfo ({ project }, context) {
        let pl = context.data?.permission
        let canUpdateInfo = pl == PL.admin || pl == PL.owner
        if (!canUpdateInfo) context.send("Action.Forbidden", { })

        let { cache, sockets } = this.services
        let theProject = cache.project.get(context.data.project.id)
        if (!theProject) context.send("Action.BadRequest", { })

        theProject.changedAt = Date.now()
        if (Object.hasOwn(project, "title")) theProject.title = project.title
        if (Object.hasOwn(project, "description")) theProject.project.data.description = project.description

        this.broadcastForProject(theProject.id, "Project.DataPatch", {
            title: theProject.title,
            data: {
                description: theProject.project.data.description
            }
        })
    }

    async onSystemSyncProjectUsers ({ project }) {
        let { logger, cache, database, sockets } = this.services
        let theProject = cache.project.get(project.id)
        if (!theProject) return
        
        let involvements = await database.projectInvolvement.query()
            .withGraphJoined("receiver")
            .where("projectId", project.id)
    
        let users = involvements.map(u=> ([u.receiver.id, {
            id: u.receiver.id,
            userName: u.receiver.userName,
            displayName: u.receiver.displayName,
            email: u.receiver.email,
            permission: u.permission
        }]))

        theProject.project.data.users = Object.fromEntries(users)
        theProject.changedAt = Date.now()

        this.broadcastForProject(theProject.id, "Project.DataPatch", {
            data: {
                users: {
                    $rewrite: true,
                    ...theProject.project.data.users
                }
            }
        })
    }

    broadcastForProject (projectId, type, data) {
        if (!projectId) return
        setTimeout(()=> {
            this.services.sockets.connections.forEach(con=> {
                if (con.data.project?.id != projectId) return
                con.send(type, data)
            })
        }, 0)
    }

    onSystemCreateInvolvement ({ project }) {
        // re-emit event
        this.events.emit("system:SyncProjectUsers", { project })
    }

    onSystemUpdateInvolvement ({ project }) {
        // re-emit event
        this.events.emit("system:SyncProjectUsers", { project })
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
    }

}
