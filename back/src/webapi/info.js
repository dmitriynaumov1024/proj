import { createRouter } from "better-express"

let route = createRouter()

route.get("", async (request, response)=> {
    response.status(200).json({
        text: "Hello! You just reached our first API endpoint. " +
              "This is a small step for one man, but a great leap for humanity! " +
              "Stay tuned!"
    })
})

export default { route }
