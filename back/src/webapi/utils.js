import { createRouter } from "better-express"
import { defineHandler } from "./__base.js"

let route = createRouter()

route.get("/info", defineHandler(async (context)=> {
    let { system } = context
    return {
        success: true,
        whatIsThis: system.infrastructure.familiar.app.name
    }
}))

route.post("/time", defineHandler(async (context)=> {
    return {
        success: true,
        time: Date.now()
    }
}))

export default { route }
