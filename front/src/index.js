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
import { createStorage, createTempStorage, persistStorage } from "./lib/storage.js"
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
http.onSessionChange(newValue => {
    storage.session = newValue
    persistStorage("proj.storage", storage)
})
app.use(installable("$http", http))

// locales
import { createLocales } from "./locale/index.js"
let locale = createLocales()
app.use(installable("$locale", locale))

// evil css hack
function setHeight () {
    document.body.style.setProperty("--height-full", window.innerHeight+"px")
}

setTimeout(()=> {
    setHeight()
    window.addEventListener("resize", setHeight)
}, 50)

// mount
app.mount(document.querySelector("#app"))

// style
import "./style/style.css"
import "./style/wsp.css"
import "./style/md.css"
