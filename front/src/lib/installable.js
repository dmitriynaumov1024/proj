// convert any thing to installable vue plugin
export function installable (key, value) {
    return {
        install (app) {
            app.config.globalProperties[key] = value
        }
    }
}
