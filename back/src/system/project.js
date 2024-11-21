import { SystemUnit } from "./__base.js"
import { base32id, base16id } from "common/utils/id"
import { filterFields } from "common/utils/object"
import { hash } from "common/utils/hash"
import { ProjectInfo as ProjectInfoModel } from "../database/models.js"

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
            data: "{ }",
            history: "{ }",
            plugins: "[ ]"
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
        let userOk = !!(context?.user?.id)
        if (!userOk) {
            return { success: false, notAuthorized: true }
        }

        let { database } = this.infrastructure

        let theProjectInvolvement = await database.projectInvolvement.query()
        .where({ projectId: project.id, receiverId: context.user.id }).first()

        let userCanUpdateProject = theProjectInvolvement && (theProjectInvolvement.permission == "admin" || theProjectInfo.permission == "owner")
        if (!userCanUpdateProject) {
            return { success: false, forbidden: true }
        }
    }
}
