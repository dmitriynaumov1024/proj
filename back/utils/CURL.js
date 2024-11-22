import { Agent, setGlobalDispatcher } from "undici"
process.removeAllListeners("warning")
setGlobalDispatcher(new Agent({
    connect: { rejectUnauthorized: false }
}))

let argStart = process.argv.findIndex(item=> item.endsWith(".js")) + 1

let argv = process.argv.slice(argStart)

let method = argv[0]
let URL = argv[1]
let payloadString = argv[2]

let headers = { 
    "Content-Type": "application/json;encoding=utf-8" 
}

try {
    let result = await fetch(URL, { 
        method, headers, body: payloadString
    })

    console.log(result.status.toString())
    console.log(await result.text())
}
catch (error) {
    if (error.cause?.code) {
        console.log("Error on fetch: "+ error.cause.code)
    }
    else {
        console.log("Error on fetch: ")
        console.log(error)
    } 
}
