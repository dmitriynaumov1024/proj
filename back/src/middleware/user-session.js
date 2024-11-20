//
// get user session from request Authorization header
//
import qs from "qs"

function userSession({ fake } = { }) {
    return async function (request, response, next) {
        let { db, logger } = request
        let user = { personId: null }
        let authorization = qs.parse(request.headers["authorization"] ?? "")
        if (fake) {
            // thats really all fake authorization!
            user.personId = Number(authorization.personId) || 0
            user.isAlive = true
        }
        else {
            if (authorization.sessionId && authorization.password) {
                let storedAuth = await db.userSession.query()
                    .where("id", Number(authorization.sessionId))
                    .first()
                if (storedAuth && storedAuth.isAlive && (storedAuth.password == authorization.password)) {
                    user.isAlive = true
                    user.personId = storedAuth.personId
                    user.sessionId = storedAuth.id
                    user.password = storedAuth.password
                    user.expiresAt = storedAuth.expiresAt
                }
            }
        }
        request.user = user
        await next()
    }
}

export {
    userSession
}
