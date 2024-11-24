import { createWebHistory, createRouter as createVueRouter } from "vue-router"
import { sleep } from "./utils.js"

function DEFAULT_PROPS () {
    return { }
}

// create props
function createProps (props) {
    // support vue-router's default behavior
    if (props instanceof Function || props === true) return props
    
    if (!props || typeof props != "object") return DEFAULT_PROPS

    // like vue's defineProps({ })  
    const propEntries = Object.entries(props)
    return ({ params, query }) => {
        let result = { }
        for (const [key, propType] of propEntries) {
            const rawPropValue = query[key] ?? params[key]
            if (propType == Number || propType == "number" || propType == "Number") {
                let val = Number(rawPropValue)
                if (Number.isNaN(val)) val = undefined
                result[key] = val
            }
            else if (propType == Boolean || propType == "boolean" || propType == "Boolean") {
                result[key] = (rawPropValue?.toLowerCase() == "true") || undefined
            }
            else if (propType == String || propType == "string" || propType == "String")
                result[key] = (rawPropValue != undefined) && String(rawPropValue) || rawPropValue
            else if (propType instanceof Function) 
                result[key] = propType(rawPropValue)
            else 
                result[key] = rawPropValue
        }
        return result
    }
}

// a custom function to define routes 
// because default mode is not sufficient any more  
export function defineRoutes (...args) {
    let [ basePath, routes ] = (args.length >= 2) ? [ args[0], args[1] ] : [ "", args[0] ]
    return routes.map (route => 
        Object.assign({ }, route, {
            path: basePath + route.path,
            props: createProps(route.props)
        })
    )
}

// create router + add a patchQuery method
export function createRouter (options) {
    let router = createVueRouter({ history: createWebHistory(), ...options })
    router.patchQuery = function (newQuery) {
        let { path, query } = this.currentRoute.value
        query = Object.assign({ }, query)
        query = Object.assign(query, newQuery)
        this.push({ path, query })
    }
    if (options.delay) {
        router.beforeEach(async (to, from, next)=> {
            if (from == "/" || !(from.path.length > 1)) {
                next()
            }
            else {
                await sleep(options.delay)
                next()
            }
        })
    }
    return router
}
