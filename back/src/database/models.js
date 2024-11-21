import { Model, type } from "better-obj"
import { pk, fk, cascade, max, belongsToOne, hasOne, unique, json } from "better-obj"

const custom = {
    Timestamp: type.Integer,
    InvolvementStatus: type.String,
    PermissionLevel: type.String
}

/*
[1][P] User
--- fields
  + id: String PK
  + userName: String unique regex([a-z][a-z0-9\_\-]+)
  + email: String
  + displayName: String
  + createdAt: Timestamp
  + confirmedAt: Timestamp
  + passwordHash: String
  + preferences: Object/String json encoded
*/
export class User extends Model 
{
    static get props() {
        return {
            id: {
                type: type.String,
                rules: [ pk() ]
            },
            userName: {
                type: type.String,
                rules: [ unique(), max(64) ]
            },
            email: {
                type: type.String,
                rules: [ max(200) ]
            },
            displayName: {
                type: type.String,
                rules: [ max(64) ]
            },
            createdAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            confirmedAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            passwordHash: {
                type: type.String,
                rules: [ ]
            },
            preferences: {
                type: type.Object,
                rules: [ json() ]
            }
        }
    }

    static rules = {
        userName: {
            min: 4,
            max: 64,
            regex: /^[a-z0-9]+$/,
            test (value) {
                return typeof value == "string" && 
                    value.length >= this.min && 
                    value.length < this.max && 
                    this.regex.test(value)
            }
        },
        email: {
            min: 4,
            max: 200,
            regex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            test (value) {
                return typeof value == "string" &&
                    value.length >= this.min && 
                    value.length < this.max && 
                    this.regex.test(value)
            }
        },
        displayName: {
            max: 64,
            test (value) {
                return typeof value == "string" && 
                    value.length < this.max
            },
            clamp (value) {
                return value.slice(0, this.max)
            }
        }
    }
}

/*
[2][1:N] UserSession
--- fields
  + id: String PK
  + userId: String FK(User)
  + token: String
  + tokenOld: String
  + shortCode: String
  + createdAt: Timestamp
  + refreshAt: Timestamp
  + expireAt: Timestamp
*/
export class UserSession extends Model
{
    static get props() {
        return {
            id: {
                type: type.String,
                rules: [ pk() ]
            },
            userId: {
                type: type.String,
                rules: [ fk(User) ]
            },
            token: {
                type: type.String,
                rules: [ ]
            },
            tokenOld: {
                type: type.String,
                rules: [ ]
            },
            shortCode: {
                type: type.String,
                rules: [ ]
            },
            createdAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            refreshAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            expireAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            user: {
                type: User,
                rules: [ belongsToOne() ]
            }
        }
    }
}

/*
[3][1:N] ProjectInfo
--- fields
  + id: String PK
  + ownerId: String FK(User)
  + title: String
  + publicRead: Boolean
  + publicClone: Boolean
  + createdAt: Timestamp
--- relations
  + owner: belongs to one User FK(ownerId)
  + project: has one Project FK(id)
*/
export class ProjectInfo extends Model
{
    static get props() {
        return {
            id: {
                type: type.String,
                rules: [ pk() ]
            },
            ownerId: {
                type: type.String,
                rules: [ fk(User) ]
            },
            title: {
                type: type.String,
                rules: [ max(128) ]
            },
            publicRead: {
                type: type.Boolean,
                rules: [ ]
            },
            publicClone: {
                type: type.Boolean,
                rules: [ ]
            },
            createdAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            owner: {
                type: User,
                rules: [ belongsToOne() ]
            },
            project: {
                type: Project,
                rules: [ hasOne() ]
            }
        }
    }

    static rules = {
        title: {
            min: 0,
            max: 128,
            default: "Untitled Project",
            clamp (value) {
                return value.slice(0, 128)
            }
        }
    }
}

/*
[4][1:1] Project
--- fields
  + id: String PK FK(ProjectInfo) delete cascade
  + data: ProjectData/String # json encoded 
  + history: ProjectHistory/String # json encoded
  + plugins: PluginVersion[]/String # json encoded
*/
export class Project extends Model
{
    static get props() {
        return {
            id: {
                type: type.String,
                rules: [ pk(), fk(ProjectInfo), cascade() ]
            },
            data: {
                type: type.Object,
                rules: [ json() ]
            },
            history: {
                type: type.Object,
                rules: [ json() ]
            },
            plugins: {
                type: type.Object,
                rules: [ json() ]
            }
        }
    }
}

/*
[5][M:N] ProjectInvolvement 
--- fields
  + projectId: String PK FK(ProjectInfo) delete cascade
  + receiverId: String PK FK(User)
  + senderId: String FK(User)
  + receiverStatus: InvolvementStatus
  + senderStatus: InvolvementStatus
  + permission: PermissionLevel
  + sentAt: Timestamp
  + acceptedAt: Timestamp
  + interactedAt: Timestamp
--- relations
  + project: belongs to one ProjectInfo FK(projectId)
  + receiver: belongs to one User FK(receiverId)
  + sender: belongs to one User FK(senderId)
*/
export class ProjectInvolvement extends Model
{
    static get props() {
        return {
            projectId: {
                type: type.String,
                rules: [ pk(), fk(ProjectInfo), cascade() ]
            },
            receiverId: {
                type: type.String,
                rules: [ pk(), fk(User), cascade() ]
            },
            senderId: {
                type: type.String,
                rules: [ fk(User), cascade() ]
            },
            receiverStatus: {
                type: custom.InvolvementStatus,
                rules: [ max(20) ]
            },
            senderStatus: {
                type: custom.InvolvementStatus,
                rules: [ max(20) ]
            },
            permission: {
                type: custom.PermissionLevel,
                rules: [ max(20) ]
            },
            sentAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            acceptedAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            interactedAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            project: {
                type: ProjectInfo,
                rules: [ belongsToOne() ]
            },
            receiver: {
                type: User,
                rules: [ belongsToOne({ fk: "receiverId" }) ]
            },
            sender: {
                type: User,
                rules: [ belongsToOne({ fk: "senderId" }) ]
            }
        }
    }
}

/*
[6][1:N] Plugin
--- fields
  + id: String PK 
  + authorId: String FK(User)
  + name: String
  + createdAt: Timestamp
  + description: String
  ^ Plugin.id can be built
    as Plugin.author.userName + Plugin.name
--- relations
  + author: belongs to one User FK(authorId)
*/
export class Plugin extends Model 
{
    static get props() {
        return {
            id: {
                type: type.String,
                rules: [ pk() ]
            },
            authorId: {
                type: type.String,
                rules: [ fk(User) ]
            },
            name: {
                type: type.String,
                rules: [ max(128) ]
            },
            createdAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            description: {
                type: type.String,
                rules: [ max(4000) ]
            },
            author: {
                type: User,
                rules: [ belongsToOne() ]
            }
        }
    }
}

/*
[7][1:N] PluginVersion
--- fields
  + id: String PK
  + pluginId: String FK(Plugin)
  + version: String
  + createdAt: Timestamp
  + publishedAt: Timestamp
  + depends: PluginVersion[]/String # json encoded
  ^ PluginVersion.id can be built
    as PluginVersion.parent.id + PluginVersion.version
--- relations
  + parent: belongs to one Plugin FK(pluginId)
*/
export class PluginVersion extends Model 
{
    static get props() {
        return {
            id: {
                type: type.String,
                rules: [ pk() ]
            },
            pluginId: {
                type: type.String,
                rules: [ fk(Plugin) ]
            },
            version: {
                type: type.String,
                rules: [ max(64) ]
            },
            createdAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            publishedAt: {
                type: custom.Timestamp,
                rules: [ ]
            },
            depends: {
                type: type.Object,
                rules: [ json() ]
            },
            parent: {
                type: Plugin,
                rules: [ belongsToOne() ]
            }
        }
    }
}
