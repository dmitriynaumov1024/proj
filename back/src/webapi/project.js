import { createRouter } from "better-express"
import { defineHandler } from "./__base.js"
import { InvolvementStatus as IS } from "../database/enums.js"

let route = createRouter()

route.post("/create", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = { user: await system.auth.getUser({ session: body.session }) }
    let result = await system.project.create({ project: body.project }, innerContext)
    return result
}))

route.post("/update", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = { user: await system.auth.getUser({ session: body.session }) }
    let result = await system.project.update({ project: body.project }, innerContext)
    return result
}))

route.post("/find", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = { user: await system.auth.getUser({ session: body.session }) }
    let result = await system.project.find({ project: body.project }, innerContext)
    return result
}))

route.post("/clone", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = { user: await system.auth.getUser({ session: body.session }) }
    let result = await system.project.clone({ project: body.project }, innerContext)
    return result
}))

route.post("/own-list", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = { user: await system.auth.getUser({ session: body.session }) }
    let result = await system.project.getOwnList({ project: body.project }, innerContext)
    return result
}))

route.post("/foreign-list", defineHandler(async (context)=> {
    let { system, body } = context
    let result = await system.project.getForeignList({ project: body.project }, { })
    return result
}))

route.post("/delete", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = { user: await system.auth.getUser({ session: body.session }) }
    let result = await system.project.delete({ project: body.project }, innerContext)
    return result
}))

route.post("/users/list", defineHandler(async (context)=> {
    let { system, body } = context
    let user = await system.auth.getUser({ session: body.session })
    return await system.user.getUsersInProject({ project: body.project }, { user: user })
}))

route.post("/involvement/list", defineHandler(async (context)=> {
    let { system, body } = context
    let user = await system.auth.getUser({ session: body.session })
    return await system.user.getUsersInProject({ project: body.project }, { user: user })
}))

route.post("/involvement/create", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = {
        user: await system.auth.getUser({ session: body.session }) 
    }
    return await system.projectInvolvement.create({ 
        projectInvolvement: body.projectInvolvement,
        project: body.project, 
        receiver: body.receiver, 
        sender: body.sender 
    }, innerContext)
}))

route.post("/involvement/update", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = {
        user: await system.auth.getUser({ session: body.session }) 
    }
    return await system.projectInvolvement.update({
        projectInvolvement: body.projectInvolvement,
        project: body.project,
        receiver: body.receiver, 
        sender: body.sender 
    }, innerContext)
}))

// is router becoming too smart?
// or just poor design?
route.post("/involvement/accept", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = {
        user: await system.auth.getUser({ session: body.session }) 
    }
    return await system.projectInvolvement.setReceiverStatus({
        projectInvolvement: body.projectInvolvement,
        status: IS.accepted
    }, innerContext)
}))

route.post("/involvement/reject", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = {
        user: await system.auth.getUser({ session: body.session }) 
    }
    return await system.projectInvolvement.setReceiverStatus({
        projectInvolvement: body.projectInvolvement,
        status: IS.rejected
    }, innerContext)
}))

route.post("/involvement/invite", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = {
        user: await system.auth.getUser({ session: body.session }) 
    }
    return await system.projectInvolvement.setSenderStatus({
        projectInvolvement: body.projectInvolvement,
        status: IS.invited
    }, innerContext)
}))

route.post("/involvement/kick", defineHandler(async (context)=> {
    let { system, body } = context
    let innerContext = {
        user: await system.auth.getUser({ session: body.session }) 
    }
    return await system.projectInvolvement.setSenderStatus({
        projectInvolvement: body.projectInvolvement,
        status: IS.rejected
    }, innerContext)
}))

export default { route }
