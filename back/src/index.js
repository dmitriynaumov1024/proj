import "dotenv/config"
const env = process.env

import fs from "node:fs"
fs.mkdirSync("./var", { recursive: true })

import { ConsoleLogger } from "better-logging"
let logger = new ConsoleLogger({
    color: env.BACKEND_LOGGER_COLOR=="true"
})

import { connections } from "./database/connect.js"
let dbConnection = connections[env.DB_PROVIDER]()

import { ProjDbAdapter } from "./database/database.js"
let dbAdapter = new ProjDbAdapter()
await dbAdapter.connect(dbConnection)
await dbAdapter.createDb()

import { mailSenders } from "./email/sender.js"
let createMailSender = mailSenders[env.MAIL_PROVIDER] || mailSenders.default
let mailer = createMailSender({
    apiKey: env.MAIL_API_KEY,
    secretKey: env.MAIL_API_SECRET,
    logger: logger 
})

let familiar = {
    promo: {
        name: env.FAMILIAR_PROMO_NAME,
        email: env.FAMILIAR_PROMO_EMAIL
    },
    system: {
        name: env.FAMILIAR_SYSTEM_NAME,
        email: env.FAMILIAR_SYSTEM_EMAIL
    },
    app: {
        name: env.FAMILIAR_APP_NAME ?? "Proj"
    },
    name: env.FAMILIAR_NAME,
    email: env.FAMILIAR_EMAIL
}

import { System } from "./system/system.js"
let system = new System({
    services: {
        logger: ()=> logger,
        database: ()=> dbAdapter,
        cache: ()=> null,
        mailer: ()=> mailer,
        familiar: ()=> familiar
    }
})

import { createServer } from "better-express"
let server = createServer({
    https: env.BACKEND_HTTPS=="true",
    key: env.BACKEND_HTTPS_KEY,
    cert: env.BACKEND_HTTPS_CERT
})

import { crossOrigin } from "better-express"
server.http.use(crossOrigin({ origins: "*" }))

import { requestLogger } from "./middleware/request-logger.js"
server.http.use(requestLogger(()=> logger))

let api = server.http.subpath("/api")

import { bodyParser } from "better-express"
api.use(bodyParser.text({ type: "application/json" }))

import { bodyTextToJson } from "./middleware/body-text-to-json.js"
api.use(bodyTextToJson())

import { requestItemProvider } from "./middleware/item-provider.js"
api.use(requestItemProvider(p=> {
    p.provide("system", ()=> system)
}))

import utils from "./webapi/utils.js"
api.use("/utils", utils.route)

import auth from "./webapi/auth.js"
api.use("/auth", auth.route)

import user from "./webapi/user.js"
api.use("/user", user.route)

import project from "./webapi/project.js"
api.use("/project", project.route)

// fallback
api.use((request, response)=> {
    response.status(404).json({
        success: false,
        notFound: true,
        message: request.originalUrl+" not found"
    })
})

import { errorCatcher } from "better-express"
server.http.app.use(errorCatcher(()=> logger))

let port = Number(env.BACKEND_PORT)

server.listen(port)
logger.log(`Server listening to port ${port}`)
