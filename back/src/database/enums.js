export const PermissionLevel = Object.assign(Object.create(null), {
    none: "none",
    view: "view",
    comment: "comment",
    edit: "edit",
    admin: "admin",
    owner: "owner",
})

export const PermissionLevelOrder = [
    "none", "view", "comment", "edit", "admin", "owner"
]

export const InvolvementStatus = Object.assign(Object.create(null), {
    none: "none",
    invited: "invited",
    accepted: "accepted",
    rejected: "rejected"
})
