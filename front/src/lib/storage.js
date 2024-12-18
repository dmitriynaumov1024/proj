import { reactive } from "vue"

// local storage adapter
export function createStorage (key, options) {
    let rawData = window.localStorage[key]
    try { 
        rawData = JSON.parse(rawData) 
    }
    catch (error) { 
        rawData = { } 
    }
    let storage = reactive(rawData)
    window.addEventListener("beforeunload", ()=> {
        if (options?.beforeUnload) options.beforeUnload.call(storage)
        persistStorage(key, storage)
    })
    return storage
}

// push storage object to window local storage
export function persistStorage (key, storage) {
    window.localStorage[key] = JSON.stringify(Object.assign({ }, storage))
}

// temporary storage
export function createTempStorage (key) {
    return reactive({ })
}
