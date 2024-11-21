import { SystemUnit } from "./__base.js"
import { base32id, base10id } from "common/utils/id"
import { hash } from "common/utils/hash"

const sessionRefreshTime = 60*60*1000 // 1 hour
const sessionExpireTime = 48*60*60*1000 // 48 hours

const shortCodeLength = 6

const sessionCleanupIntervalTime = 60*1000 // 60 seconds

export class Auth extends SystemUnit 
{
    constructor(options) {
        super(options)
        this.intervals ??= [ ]
        this.intervals.push(
            setInterval(()=> this.removeExpiredSessions(), sessionCleanupIntervalTime)
        )
    }

    async removeExpiredSessions () {
        let { database, logger } = this.infrastructure
        let count = await database.userSession.query()
            .where("expireAt", "<", Date.now() - 1000).delete()
        if (count > 0) {
            logger.warn(`Cleaned up ${count} expired sessions`)
        }
    }

    /*
    assume user = { id: String }, shortCode = true|false
    */
    async createSession ({ user, shortCode }) {
        let { database } = this.infrastructure

        let now = Date.now()
        let session = await database.userSession.query().insert({
            id: user.id.slice(8, 24) + base32id(24),
            userId: user.id,
            shortCode: shortCode? base10id(shortCodeLength) : null,
            createdAt: now,
            refreshAt: now + sessionRefreshTime,
            expireAt: now + sessionRefreshTime // for first time
        })

        return session
    }

    /*
    assume session = { id: String, token: String }, wholeUser = true|false
    this method returns { id } if session represents a real valid user session
    */
    async getUser ({ session, wholeUser }) {
        let { database } = this.infrastructure

        let reqSessionOk = session && session.id?.length && session.token?.length
        if (!reqSessionOk) {
            return false 
        }

        let now = Date.now()
        let theSession = wholeUser? 
            await database.userSession.query().withGraphFetched("user").where("id", session.id).first() :
            await database.userSession.query().where("id", session.id).first()
        if (!theSession) {
            return false
        }

        let freshOk = theSession.expireAt > now
        if (!freshOk) {
            return false
        }

        let tokenOk = session.token == theSession.token || 
                      session.token == theSession.tokenOld
        if (!tokenOk) {
            return false
        }

        return wholeUser? theSession.user : ({ id: theSession.userId })
    }   

    /*
    assume user = { email: String }, shortCode = String
    */
    sendShortCode ({ user, shortCode }) {
        let { mailer } = this.infrastructure

        setTimeout(async ()=> await mailer.send({ 
            sender: {
                name: "Proj",
                email: "noreply@example.com"
            },
            recipient: {
                email: user.email
            },
            subject: "Confirmation code",
            text: `Your confirmation code for Proj is ${shortCode}.\n` + 
                  `Proj : : ${new Date().toISOString()}\n`
        }), 0)
    }

    /*
    client does:
        sends POST ./auth/begin { user { userName } }
    server does:
        if (user not exists):
            return { success: false, notFound: true } 
        else if (user has password): 
            create user session
            if (user.preferences.alwaysShortCode):
                async send short code to user's email
                return { 
                    success: true, method: ["shortCode", "password"], 
                    session: { id }
                }
            else:
                return { 
                    success: true, method: ["password"],
                    session: { id }
                }
        else:
            create user session
            async send short code to user's email
            return { 
                success: true, method: ["shortCode"],
                session: { id }
            }
    client does: 
        go to #4 [complete auth]
    */
    async beginAuth ({ user }) {
        let { database, mailer } = this.infrastructure

        if (!user.userName) return { success: false, bad: ["userName"] }

        let theUser = await database.user.query().where("userName", user.userName).first()
        if (!theUser) return { success: false, bad: ["userName"] }

        let needsShortCode = !theUser.passwordHash || theUser.preferences?.alwaysShortCode
        let session = await this.createSession({ user: { id: theUser.id }, shortCode: needsShortCode })

        let authMethod = theUser.passwordHash?
            needsShortCode? ["password", "shortCode"] : ["password"] :
            ["shortCode"]

        if (needsShortCode) {
            this.sendShortCode({ user: theUser, shortCode: session.shortCode })
        }

        return {
            success: true,
            session: { id: session.id },
            method: authMethod
        }
    }

    /*
    client does:
        sends POST ./auth/complete { 
            user { password, shortCode }, session { id } 
        }
    server does:
        if (session not exists) or (session expired): 
            return { success: false, expired: true }
        else if (password not valid):
            return { success: false, bad: "password" }
        else if (shortCode not valid):
            return { success: false, bad: "shortCode" }
        else: 
            return { success: true, session: { id, token, refreshAt } }
    client is now logged in
    */
    async completeAuth ({ user, session }) {
        let { database } = this.infrastructure

        let sessionOk = session?.id?.length
        if (!sessionOk) return { success: false, bad: "session" }

        let now = Date.now()
        let theSession = await database.userSession.query().withGraphFetched("user").where("id", session.id).first()
        if (!theSession || session.expireAt < now) return { success: false, expired: true }

        let theUser = theSession.user

        let thePassword = theUser.passwordHash
        if (thePassword?.length) {
            let passwordOk = user.password && (await hash(user.password) == thePassword)
            if (!passwordOk) return { success: false, bad: "password" }
        }

        let theShortCode = theSession.shortCode
        if (theShortCode?.length) {
            let shortCodeOk = theSession.shortCode == user.shortCode
            if (!shortCodeOk) return { success: false, bad: "shortCode" }
        }

        if (!thePassword && !theShortCode) {
            return { success: false, badRequest: true, sussyRequest: true }
        }

        let newSession = {
            shortCode: null,
            token: base32id(255),
            expireAt: now + sessionExpireTime,
            refreshAt: now + sessionRefreshTime
        }

        await database.userSession.query().where("id", session.id).patch(newSession)

        if (theUser.confirmedAt == null) {
            await database.user.query().where("id", theUser.id).patch({ confirmedAt: now })
        }

        return {
            success: true,
            session: {
                id: theSession.id,
                token: newSession.token,
                refreshAt: newSession.refreshAt
            }
        }
    }

    /*
    client does:
    sends POST ./auth/forgotpass { user { userName } }
    server does:
        if (user not exists):
            return { success: false, notFound: true } 
        else: 
            create user session
            async send short code to user's email
            return { success: true, method: ["shortCode"], session: { id } }
    */
    async forgotPass ({ user }) {
        let { database } = this.infrastructure

        if (!user.userName) return { success: false, bad: ["userName"] }

        let theUser = await database.user.query().where("userName", user.userName).first()
        if (!theUser) return { success: false, bad: ["userName"] }

        let session = await this.createSession({ user: { id: theUser.id }, shortCode: true })
        this.sendShortCode({ user: theUser, shortCode: session.shortCode })

        return {
            success: true,
            session: { id: session.id },
            method: ["shortCode"]
        }
    }

    /*
    client does:
        sends POST ./auth/resetpass { 
            session { id }, user { shortCode }
        }
    server does:
        if (session not exists) or (session expired):
            return { success: false, expired: true }
        else if (shortCode not valid): 
            return { success: false, bad: "shortCode" }
        else: 
            return { success: true, session: { id, token, refreshAt } }
    client is now logged in
    */
    async resetPass ({ user, session }) {
        let { database } = this.infrastructure

        if (!user.shortCode) return { success: false, bad: "shortCode" }
        
        let sessionOk = session?.id?.length
        if (!sessionOk) return { success: false, bad: "session" }

        let now = Date.now()
        let theSession = await database.userSession.query().withGraphFetched("user").where("id", session.id).first()
        if (!theSession || session.expireAt < now) return { success: false, expired: true }

        let theShortCode = theSession.shortCode
        if (theShortCode?.length) {
            let shortCodeOk = theSession.shortCode == user.shortCode
            if (!shortCodeOk) return { success: false, bad: "shortCode" }
        }
        else {
            return { success: false, badRequest: true, sussyRequest: true }
        }

        await database.user.query().where("id", theSession.user.id).patch({
            passwordHash: null,
            confirmedAt: theSession.user.confirmedAt ?? now
        })

        let newSession = {
            shortCode: null,
            token: base32id(255),
            expireAt: now + sessionExpireTime,
            refreshAt: now + sessionRefreshTime
        }

        await database.userSession.query().where("id", theSession.id).patch(newSession)

        return {
            success: true,
            session: {
                id: theSession.id,
                token: newSession.token,
                refreshAt: newSession.refreshAt
            }
        }
    }

    /*
    client does:
        sends POST ./auth/ping {
            session { id, token }
        }
    server does:
        if (session not exists) or (session not valid):
            return { success: false }
        else if (session to be refreshed):
            return { success: true, session: { id, token } }
        else:
            return { success: true, session: { id } }
    */
    async ping ({ session }) {
        let sessionOk = session && session.id && session.token
        if (!sessionOk) return { success: false, bad: "session", badRequest: true }

        let { database } = this.infrastructure

        let now = Date.now()
        let theSession = await database.userSession.query().where("id", session.id).first()
    
        if (!theSession) return { success: false, bad: "session", notFound: true }

        let freshOk = theSession.expireAt > now
        if (!freshOk) return { success: false, bad: "session", expired: true }

        let tokenOk = session.token == theSession.token || 
                      session.token == theSession.tokenOld
        if (!tokenOk) return { success: false, bad: "session", badToken: true }

        let needsRefresh = theSession.refreshAt <= now
        if (needsRefresh) {
            theSession.refreshAt = now + sessionRefreshTime
            theSession.expireAt = now + sessionExpireTime
            theSession.tokenOld = theSession.token
            theSession.token = base32id(255)
            await database.userSession.query().where("id", session.id).patch({
                refreshAt: theSession.refreshAt,
                expireAt: theSession.expireAt,
                tokenOld: theSession.tokenOld,
                token: theSession.token
            })
            return {
                success: true,
                session: {
                    id: theSession.id,
                    token: theSession.token,
                    refreshAt: theSession.refreshAt
                }
            }
        }
        else {
            return {
                success:true,
                session: {
                    id: theSession.id
                }
            }
        }
    }
}
