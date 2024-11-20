//
// request logger
//
function requestLogger(loggerFactoryFunc) {
    return async function (request, response, next) {
        let logger = loggerFactoryFunc()
        logger.log(`${request.method} ${request.originalUrl}`)
        await next()
    }
}

export {
    requestLogger
}
