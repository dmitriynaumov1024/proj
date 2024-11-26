import { reactive } from "vue"
import { nestedMerge } from "common/utils/object"
import c from "./default.js"
import en from "./lang/en.js"

function LocaleProxy (locale) {
    if (locale instanceof Object) {
        for (let key in locale) {
            if (locale[key] instanceof Object) locale[key] = LocaleProxy(locale[key])
        }
        return new Proxy(locale, {
            get (target, key) {
                if (target[key]) return target[key]
                else return "!BadLocaleKey:"+key
            }
        })
    }
    return locale
}

let locales = {
    en: LocaleProxy(nestedMerge(c, en))
}

export function createLocales () {
    let __id = "en"
    return reactive({
        current: locales[__id],
        get id() {
            return __id
        },
        get knownIds() {
            return Object.keys(locales)
        },
        set (id) {
            if(locales[id]) {
                this.current = locales[id]
                __id = id 
            }
        }
    })
}
