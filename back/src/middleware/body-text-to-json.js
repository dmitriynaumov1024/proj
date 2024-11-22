export function bodyTextToJson () {
    return async function (request, response, next) {
        if (!request.body || request.body.length < 2 || request.body == "undefined" || request.body == "null") {
            request.body = { }
        }
        else if (typeof request.body == "string") {
            try {
                let body = JSON.parse(request.body)
                if (!(body instanceof Object)) body = { }
                request.body = body
            }
            catch (error) {
                return response.status(400).json({
                    success: false,
                    badRequest: true,
                    badJsonFormat: true
                })
            }
        }
        await next()
    }
}
