import { makeEnum } from "../utils/object.js"

export const FundamentalTaskStatusOrder = [
    "unknown", "todo", "working", "finished", "rejected"
]

export const FundamentalTaskStatus = makeEnum(
    FundamentalTaskStatusOrder
)

export const TaskObjectType = makeEnum([
    "Task", "Milestone", "TaskSet"
])

export const ObjectType = makeEnum([
    "Task", "Milestone", "TaskSet", "TaskTemplate"
])

export const TaskObjectFieldTypes = makeEnum ([
    "boolean", "integer", "number", "string", "enum", "timestamp"
])

export const ObjectPermissionLevelOrder = [
    null, "view", "comment", "edit"
]

export const ObjectPermissionLevel = makeEnum (
    ObjectPermissionLevelOrder
)

export const PermissionLevelOrder = [
    "none", "view", "comment", "edit", "admin", "owner"
]

export const PermissionLevel = makeEnum (
    PermissionLevelOrder
)
