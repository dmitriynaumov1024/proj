import { SystemUnit } from "./__base.js"
import { base32id, base16id } from "common/utils/id"
import { filterFields } from "common/utils/object"
import { hash } from "common/utils/hash"
import { ProjectInfo as ProjectInfoModel } from "../database/models.js"
import { PermissionLevel as PL, InvolvementStatus as IS } from "../database/enums.js"

export class Project extends SystemUnit
{
    /*
    Create project
    assume client logged in
    client does:
        sends POST ./project/create {
            session { id, token },
            project { title? }
        }
    server does:
        if (session not valid):
            return { success: false, notAuthorized: true }
        else if (user can not create project):
            return { success: false, forbidden: true }
        else:
            return {
                success: true,
                project: { id }
            }
    project.create
        + id = uuid()
        + createdAt = Date.now()
        + ownerId = context.user.id
        + title = request.project.title ?? "Untitled Project"
        + publicRead = false
        + publicClone = false
    */
    async create ({ project }, context) {
        let userOk = !!(context?.user?.id)
        if (!userOk) {
            return { success: false, notAuthorized: true }
        }

        let { database } = this.infrastructure
        let userCanCreateProject = true
        if (!userCanCreateProject) {
            return { success: false, forbidden: true }
        }

        let now = Date.now()
        let theProjectInfo = await database.projectInfo.query().insert({
            id: base16id(24) + (now & 0xffffff | 0x800000).toString(16),
            ownerId: context.user.id,
            title: ProjectInfoModel.rules.title.clamp(
                project?.title ?? ProjectInfoModel.rules.title.default
            ),
            createdAt: now,
            publicRead: false,
            publicClone: false
        })

        let theProject = await database.project.query().insert({
            id: theProjectInfo.id,
            data: { },
            history: { },
            plugins: [ ]
        })

        let { projectInvolvement } = await this.parent.projectInvolvement.create({
            project: { id: theProject.id },
            receiver: { id: context.user.id, permission: "owner" },
            sender: { id: context.user.id },
            verified: true,
            autoAccept: true
        })

        return {
            success: true,
            project: { id: theProjectInfo.id },
            projectInvolvement: projectInvolvement
        }
    }

    /*
    Update project
    assume client logged in
    client does: 
        sends POST ./project/update {
            session { id, token },
            project { id, title, publicRead, publicClone }
        }
    server does:
        if (session not valid):
            return { success: false, notAuthorized: true }
        else if (project not found):
            return { success: false, notAuthorized: true }
        else if (user can not update project):
            return { success: false, forbidden: true }
        else:
            return {
                success: true,
                project: { id }
            }
    */
    async update ({ project }, context) {
        let requestOk = project?.id
        if (!requestOk) return { success: false, notFound: true, badRequest: true }

        let userOk = !!(context?.user?.id)
        if (!userOk) return { success: false, notAuthorized: true }
        
        let { database } = this.infrastructure

        let involvement = await database.projectInvolvement.query()
        .withGraphFetched("project")
        .where({ projectId: project.id, receiverId: context.user.id }).first()

        let userCanUpdateProject = involvement && 
            (involvement.permission == PL.admin || involvement.permission == PL.owner)
        if (!userCanUpdateProject) {
            return { success: false, notAuthorized: true, forbidden: true }
        }

        let theProject = involvement.project

        let newProject = {
            id: project.id,
            title: ProjectInfoModel.rules.title.clamp( project.title ?? theProject.title ),
            publicRead: project.publicRead ?? theProject.publicRead,
            publicClone: project.publicClone ?? theProject.publicClone
        }

        await database.projectInfo.query().where("id", project.id).patch(newProject)
        return {
            success: true,
            project: Object.assign(theProject, newProject)
        }

    }

    /* 
    Find one project by id
    client optionally logged in
    client does: 
        sends POST ./project/find {
            session? { id, token },
            project { id }
        }
    server does:
        let project = get project by id
        if (project is null):
            return { success: false, notFound: true }
        let allowed = false
        if (project is publicRead): allowed = true
        else:
            let user = get user by session
            if (user is project owner): allowed = true
            else if (exists project involvement where user is receiver) 
            and (permission >= read): allowed = true
        if (allowed): 
            return { success: true, project: project, involvement?: involvement }
        else:
            return { success: false, notAuthorized: true }
    */
    async find ({ project }, context) {
        let requestOk = project?.id
        if (!requestOk) return { success: false, badRequest: true, bad: "project" }

        let { database } = this.infrastructure

        let theProject = await database.projectInfo.query().where("id", project.id).first()
        if (!theProject) return { success: false, notFound: true }

        let projectInvolvement = null
        if (context?.user?.id) {
            projectInvolvement = await database.projectInvolvement.query()
            .where("projectId", project.id).where("receiverId", context.user.id).first()
        }

        let allowed = theProject.publicRead || 
            (projectInvolvement?.permission && projectInvolvement?.permission != PL.none)

        if (!allowed) return { success: false, notAuthorized: true}

        return {
            success: true,
            project: theProject,
            projectInvolvement: projectInvolvement
        }
    }

    /*
    Clone project by id
    assume client is logged in
    client does: 
        sends POST ./project/clone {
            session? { id, token },
            project { id }
        }
    server does:
        let user = get user by session
        if (user is null):
            return { success: false, notAuthorized: true }
        let project = get project by id
        if (project is null):
            return { success: false, notFound: true }
        let allowed = false
        if (project is publicRead and publicClone): allowed = true
        else:
            if (user is project owner): allowed = true
            else if (exists project involvement where user is receiver) 
            and (permission >= read): allowed = true
        if (allowed): 
            create copy of the project
            return { success: true, project: { id } }
        else:
            return { success: false, notAuthorized: true }
    */
    async clone ({ project }, context) {
        let { database } = this.infrastructure

        let userOk = context?.user?.id
        if (!userOk) return { success: false, notAuthorized: true }

        let requestOk = project?.id
        if (!requestOk) return { success: false, badRequest: true }

        let theProject = await database.projectInfo.query().where("id", project.id).first()
        if (!theProject) return { success: false, notFound: true }
        
        let involvement = await database.projectInvolvement.query()
            .where("projectId", project.id).where("receiverId", context.user.id).first()
        
        let allowed = (theProject.publicRead && theProject.publicClone) ||
            (involvement?.permission && involvement?.permission != PL.none)

        if (!allowed) return { success: false, notAuthorized: true }
        
        let now = Date.now()
        let newProjectInfo = {
            id: base16id(24) + (now & 0xffffff | 0x800000).toString(16),
            ownerId: context.user.id,
            title: ProjectInfoModel.rules.title.clamp(
                "Copy of " + (project?.title ?? ProjectInfoModel.rules.title.default)
            ),
            createdAt: now,
            publicRead: false,
            publicClone: false
        }
        let newProject = {
            id: newProjectInfo.id,
            data: { },
            history: { },
            plugins: [ ]
        }
        
        await database.projectInfo.query().insert(newProjectInfo)
        await database.project.query().insert(newProject)

        let { projectInvolvement } = await this.parent.projectInvolvement.create({
            project: { id: newProjectInfo.id },
            receiver: { id: context.user.id, permission: "owner" },
            sender: { id: context.user.id },
            verified: true,
            autoAccept: true
        })

        return { 
            success: true, 
            project: { id: newProjectInfo.id },
            projectInvolvement: projectInvolvement
        }
    }
}
