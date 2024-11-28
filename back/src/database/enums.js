import { makeEnum } from "common/utils/object"

export const PermissionLevelOrder = [
    "none", "view", "comment", "edit", "admin", "owner"
]

export const PermissionLevel = makeEnum (
    PermissionLevelOrder
)

export const InvolvementStatus = makeEnum ([
    "none", "invited", "accepted", "rejected"
])

export const FundamentalTaskStatus = makeEnum ([
    "unknown", "todo", "working", "finished", "rejected"
])

export const TaskObjectFieldTypes = makeEnum ([
    "boolean", "integer", "number", "string", "enum", "timestamp"
])

export const TaskObjectTypes = makeEnum ([
    "Task", "Milestone", "TaskSet", "TaskTemplate"
])

export const TaskObjectPermissionLevelOrder = [
    null, "view", "comment", "edit"
]

export const TaskObjectPermissionLevel = makeEnum (
    TaskObjectPermissionLevelOrder
)
