export function itemProvider (context) {
    return {
        provide (key, itemProvideFunc) {
            context[key] = itemProvideFunc(context)
        }
    }
}

export function requestItemProvider (providerActionFunc) {
    return async function (request, response, next) {
        let provider = itemProvider(request)
        let result = providerActionFunc(provider)
        if (result instanceof Promise) result = await result
        await next()
    }
}

/*
Example:
app.use(requestItemProvider(p => {
    p.provide("logger", ()=> logger)
    p.provide("database", ()=> databaseAdapter)
}))

*/
