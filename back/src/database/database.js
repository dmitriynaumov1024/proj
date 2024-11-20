import { User, UserSession, ProjectInfo, Project, ProjectInvolvement, Plugin, PluginVersion } from "./models.js"
import { DbAdapter } from "better-obj"

export class ProjDbAdapter extends DbAdapter
{
    constructor() {
        // key - name of table
        // value - table definition
        super({
            user: User,
            userSession: UserSession,
            projectInfo: ProjectInfo,
            project: Project,
            projectInvolvement: ProjectInvolvement,
            plugin: Plugin,
            pluginVersion: PluginVersion
        })
    }
}
