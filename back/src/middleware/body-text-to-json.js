export function bodyTextToJson () {
    return async function (request, response, next) {
        try {
            let body = JSON.parse(request.body)
            if (!(body instanceof Object)) body = { }
            request.body = body
            await next()
        }
        catch (error) {
            return response.status(400).json({
                success: false,
                badRequest: true,
                badJsonFormat: true
            })
        }
    }
}
