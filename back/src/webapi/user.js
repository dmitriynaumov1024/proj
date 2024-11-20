import { createRouter } from "better-express"
import { defineHandler } from "./__base.js"

let route = createRouter()

route.post("/create", defineHandler(async (context)=> {
    let { system, body } = context
    let result = await system.user.create({ user: body.user })
    return result
}))

route.post("/update", defineHandler(async (context)=> {
    let { system, body } = context
    let user = await system.auth.getUser({ session: body.session })
    let result = await system.user.update({ user: body.user }, { user: user }) 
    return result
}))

route.post("/updatepass", defineHandler(async (context)=> {
    let { system, body } = context
    let user = await system.auth.getUser({ session: body.session })
    let result = await system.user.updatePass({ user: body.user }, { user: user })
    return result
}))

export default { route }
