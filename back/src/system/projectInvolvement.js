import { SystemUnit } from "./__base.js"
import { base32id, base16id } from "common/utils/id"
import { filterFields } from "common/utils/object"
import { PermissionLevel as PL, InvolvementStatus as IS } from "../database/enums.js"

export class ProjectInvolvement extends SystemUnit
{
    constructor (options) {
        super(options)
        this.events.on("system:CreateInvolvement", (event)=> this.sendInvite(event))
        this.events.on("system:UpdateInvolvement", (event)=> { /*ignore*/ })
    }

    /*
    Send invite notification
    */
    async sendInvite ({ receiver, sender, project }) {
        let { mailer, familiar } = this.infrastructure
        
        let senderUserName = sender.displayName? 
            `${sender.displayName} (@${sender.userName})` : 
            `User @${sender.userName}`
        let receiverUserName = receiver.displayName?
            `${receiver.displayName} (@${receiver.userName})` : 
            `@${sender.userName}`

        await mailer.send({
            sender: {
                name: familiar.system.name,
                email: familiar.system.email
            },
            recipient: {
                email: receiver.email
            },
            subject: "Project invite",
            text: `Hello there ${receiverUserName}.\n` +
                `${senderUserName} invites you into a project.\n` +
                `- project: ${project.title}\n` +
                `- permission level: ${project.permission}\n` +
                `${familiar.system.name} : : ${new Date().toISOString()}\n` 
        })
    }

    /*
    Create project involvement
    */
    async create ({ projectInvolvement, project, sender, receiver, verified, autoAccept }, context) {
        let { database } = this.infrastructure

        if (!!projectInvolvement) {
            project ??= { id: projectInvolvement.projectId }
            sender ??= { id: projectInvolvement.senderId }
            receiver ??= { 
                id: projectInvolvement.receiverId, 
                permission: projectInvolvement.permission 
            }
        }

        let theProject = null,
            theReceiver = null,
            theSender = null

        if (!verified) {
            // project should exist
            theProject = !!(project?.id) && await database.projectInfo.query().where({ id: project.id }).first()
            if (!theProject) return { success: false, notFound: true, bad: "project" }

            // receiving user should exist
            theReceiver = !!(receiver?.id) && await database.user.query().where({ id: receiver.id }).first()
            if (!theReceiver) return { success: false, notFound: true, bad: "receiver" }

            // sending user should exist and have "admin" permission in this project
            theSender = (sender?.id == context?.user?.id) && 
                await database.projectInvolvement.query().withGraphJoined("receiver")
                .where({ projectId: project.id, receiverId: sender.id }).first()
            let theSenderOk = theSender && (theSender.permission == PL.admin || theSender.permission == PL.owner)
            if (!theSenderOk) return { success: false, notAuthorized: true, bad: "sender" }
        }

        let existingInvolvement = await database.projectInvolvement.query()
            .where({ projectId: project.id, receiverId: receiver.id }).first()

        if (existingInvolvement) return { 
            success: false, exists: true, 
            projectInvolvement: existingInvolvement 
        }

        let now = Date.now()
        let result = await database.projectInvolvement.query().insert({
            projectId: project.id,
            receiverId: receiver.id,
            senderId: sender.id,
            receiverStatus: autoAccept? IS.accepted : IS.invited,
            senderStatus: IS.invited,
            permission: PL[project.permission] ?? PL[receiver.permission] ?? PL.none,
            sentAt: now,
            acceptedAt: autoAccept? now : null,
            interactedAt: autoAccept? now : null
        })

        // if not autoaccept, system should send 
        // notification to receiver's email address.
        if (!autoAccept) {
            this.events.emit("system:CreateInvolvement", { 
                receiver: theReceiver, 
                sender: theSender.receiver, 
                project: {
                    id: theProject.id,
                    title: theProject.title,
                    permission: result.permission
                },
                permission: result.permission
            })
        }

        return {
            success: true,
            projectInvolvement: result
        }
    }

    /*
    Update project involvement
    mutable fields:
        + permission
    */
    async update ({ projectInvolvement, project, sender, receiver, verified }, context) {
        let { database } = this.infrastructure

        if (!!projectInvolvement) {
            project ??= { id: projectInvolvement.projectId }
            sender ??= { id: projectInvolvement.senderId }
            receiver ??= { 
                id: projectInvolvement.receiverId, 
                permission: projectInvolvement.permission 
            }
        }

        if (!verified) {
            // project should exist
            let theProject = !!(project?.id) && await database.projectInfo.query().where({ id: project.id }).first()
            if (!theProject) return { success: false, notFound: true, bad: "project" }

            // receiving user should exist
            let theReceiver = !!(receiver?.id) && await database.user.query().where({ id: receiver.id }).first()
            if (!theReceiver) return { success: false, notFound: true, bad: "receiver" }

            // sending user should exist and have "admin" permission in this project
            let theSender = (sender?.id == context?.user?.id) && 
                await database.projectInvolvement.query()
                .where({ projectId: project.id, receiverId: sender.id }).first()
            let theSenderOk = theSender && (theSender.permission == PL.admin || theSender.permission == PL.owner)
            if (!theSenderOk) return { success: false, notAuthorized: true, bad: "sender" }
        }

        let existingInvolvement = await database.projectInvolvement.query()
        .where({ projectId: project.id, receiverId: receiver.id }).first()

        if (!existingInvolvement) return { 
            success: false, notFound: true
        }

        let newInvolvement = {
            permission: PL[project.permission] ?? PL[receiver.permission]
        }

        if (!newInvolvement.permission || newInvolvement.permission == existingInvolvement.permission) {
            return { success: false, changed: false, projectInvolvement: existingInvolvement }
        } 

        Object.assign(existingInvolvement, newInvolvement)
        await database.projectInvolvement.query()
            .where({ projectId: project.id, receiverId: receiver.id })
            .patch(newInvolvement) 

        this.events.emit("system:UpdateInvolvement", {
            project: { id: project.id },
            receiver: { id: theReceiver.id, userName: theReceiver.userName },
            permission: newInvolvement.permission
        })

        return {
            success: true,
            projectInvolvement: existingInvolvement
        }
    }

    /* 
    Set receiver status accepted|rejected
    assume context = { user { id } }
    */
    async setReceiverStatus ({ projectInvolvement, status }, context) {
        let { database } = this.infrastructure

        let requestOk = !!projectInvolvement && 
            projectInvolvement.projectId && 
            projectInvolvement.receiverId && 
            projectInvolvement.receiverId == context.user.id &&
            IS[status]
        if (!requestOk) {
            return { success: false, badRequest: true }
        }

        let existingInvolvement = await database.projectInvolvement.query()
            .where("projectId", projectInvolvement.projectId)
            .where("receiverId", projectInvolvement.receiverId).first()
        if (!existingInvolvement) {
            return { success: false, notFound: true }
        }

        let newInvolvement = { receiverStatus: IS[status] }
        if (status == IS.accepted && !existingInvolvement.acceptedAt) {
            newInvolvement.acceptedAt = Date.now()
        }

        if (newInvolvement.receiverStatus == existingInvolvement.receiverStatus) {
            return { success: false, changed: false }
        }

        await database.projectInvolvement.query()
            .where("projectId", projectInvolvement.projectId)
            .where("receiverId", projectInvolvement.receiverId)
            .patch(newInvolvement)

        return {
            success: true,
            projectInvolvement: Object.assign(existingInvolvement, newInvolvement)
        }
    }

    /*
    Set sender status invited|rejected
    if senderStatus is rejected, receiver will 
    effectively be blacklisted from project 
    */
    async setSenderStatus ({ projectInvolvement, status }, context) {
        let { database } = this.infrastructure

        let requestOk = !!projectInvolvement && 
            projectInvolvement.projectId && 
            projectInvolvement.receiverId && 
            context?.user?.id && IS[status]
        if (!requestOk) {
            return { success: false, badRequest: true }
        }

        let managerInvolvement = await database.projectInvolvement.query()
            .where("projectId", projectInvolvement.projectId)
            .where("receiverId", context.user.id)
            .first()

        let permissionOk = 
            managerInvolvement.permission == PL.admin || 
            managerInvolvement.permission == PL.owner

        if (!permissionOk) {
            return { success: false, notAuthorized: true }
        }

        let existingInvolvement = await database.projectInvolvement.query()
            .where("projectId", projectInvolvement.projectId)
            .where("receiverId", projectInvolvement.receiverId).first()
        if (!existingInvolvement) {
            return { success: false, notFound: true }
        }

        let newInvolvement = { 
            senderStatus: IS[status],
            receiverStatus: IS.none,
            senderId: context.user.id,
            permission: PL[projectInvolvement.permission] ?? existingInvolvement.permission 
        }

        let changed = newInvolvement.senderStatus && 
            newInvolvement.senderStatus != existingInvolvement.senderStatus

        if (!changed) {
            return { success: false, changed: false, projectInvolvement: existingInvolvement }
        }

        await database.projectInvolvement.query()
            .where("projectId", projectInvolvement.projectId)
            .where("receiverId", projectInvolvement.receiverId)
            .patch(newInvolvement)

        this.events.emit("system:UpdateInvolvement", {
            project: { id: projectInvolvement.projectId },
            receiver: { id: projectInvolvement.receiverId },
            permission: newInvolvement.permission
        })

        return {
            success: true,
            projectInvolvement: Object.assign(existingInvolvement, newInvolvement)
        }
    }
} 

