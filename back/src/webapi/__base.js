export function defineHandler (handlerFunc) {
    return async (request, response)=> {
        let result = await handlerFunc(request, response)
        return response.status(result.success? 200 : 400)
            .append("Cache-Control", "public, max-age=3")
            .json(result)
    }
}
