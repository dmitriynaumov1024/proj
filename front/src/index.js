import { createApp, h } from "vue"
import { RouterView } from "vue-router"
let app = createApp({
    render() {
        return h("div", { class: ["layer-0", "hfull", "w100"] }, [
            h(RouterView)
        ])
    }
})

// storage
import { installable } from "./lib/installable.js"
import { createStorage, createTempStorage } from "./lib/storage.js"
let storage = createStorage("proj.storage", {
    beforeUnload() { this.session = app.config.globalProperties.$http.session }
})
app.use(installable("$storage", storage))

let tempStorage = createTempStorage()
app.use(installable("$temp", tempStorage))

// routing
import { createRouter } from "./lib/router.js"
import { routes } from "./routing/routes.js"
let router = createRouter({ routes, delay: 120 })
app.use(router)

// http client
import { createHttpClient } from "./lib/httpClient.js"
let http = createHttpClient("/api", storage.session)
app.use(installable("$http", http))

// mount
app.mount(document.querySelector("#app"))

// style
import "./style/style.css"
