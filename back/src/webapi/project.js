import { createRouter } from "better-express"
import { defineHandler } from "./__base.js"
import { InvolvementStatus as IS } from "../database/enums.js"

let route = createRouter()

route.post("/create", defineHandler(async (context)=> {
    let { system, body } = context
    let sesiUser = await system.auth.getUser({ session: body.session }) 
    let result = await system.project.create({ project: body.project }, { user: sesiUser })
    return result
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
