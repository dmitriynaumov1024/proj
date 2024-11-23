import { createApp, h } from "vue"

import { createRouter } from "./lib/router.js"
import { routes } from "./routing/routes.js"

let router = createRouter({ routes })

import {RouterView} from "vue-router"
let MainAppTemplate = {
    render() {
        return h(RouterView)
    }
}

let app = createApp(MainAppTemplate)
app.use(router)
app.mount(document.querySelector("#main-app"))
