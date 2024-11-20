import { createRouter } from "better-express"
import { defineHandler } from "./__base.js"

let route = createRouter()

route.post("/begin", defineHandler(async (context)=> {
    let { system, body } = context
    return await system.auth.beginAuth({ user: body.user })
}))

route.post("/complete", defineHandler(async (context)=> {
    let { system, body } = context
    return await system.auth.completeAuth({ 
        user: body.user, 
        session: body.session 
    })
}))

route.post("/forgotpass", defineHandler(async (context)=> {
    let { system, body } = context
    return await system.auth.forgotPass({ user: body.user })
}))

route.post("/resetpass", defineHandler(async (context)=> {
    let { system, body } = context
    return await system.auth.resetPass({ 
        user: body.user, 
        session: body.session 
    })
}))

route.post("/ping", defineHandler(async (context)=> {
    let { system, body } = context
    return await system.auth.ping({ 
        session: body.session 
    })
}))

export default { route }
