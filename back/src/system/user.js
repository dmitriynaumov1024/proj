import { SystemUnit } from "./__base.js"
import { User as UserModel } from "../database/models.js"
import { base32id } from "common/utils/id"
import { filterFields } from "common/utils/object"
import { hash } from "common/utils/hash"

export class User extends SystemUnit
{
    /*
    client does:
        sends POST ./user/create { user { userName, email, displayName } }
    server does:
        if (userName is not valid):
            return { success: false, bad: "userName" }
        else if (email is not valid): 
            return { success: false, bad: "email"}
        else if (userName exists in db):
            return { success: false, exists: "userName" } 
        else:
            add user to db.users
            return { success: true }
    */
    async create ({ user }) {
        let { database } = this.infrastructure
        let userRules = UserModel.rules
        
        let userNameOk = user.userName && userRules.userName.test(user.userName)
        if (!userNameOk) {
            return { success: false, bad: ["userName"] }
        }

        let emailOk = user.email && userRules.email.test(user.email) 
        if (!emailOk) {
            return { success: false, bad: ["email"] }
        } 

        let usernameExists = await database.user.query().where("userName", user.userName).first()
        if (usernameExists) {
            return { success: false, exists: "userName" }
        }

        let newUser = await database.user.query().insert({
            id: base32id(32),
            userName: user.userName,
            email: user.email,
            displayName: userRules.displayName.clamp(user.displayName),
            preferences: { },
            createdAt: Date.now()
        })

        return {
            success: true,
            user: {
                id: newUser.id,
                userName: newUser.userName
            }
        }
    }

    /*
    assume context = { user { id } }
    client does:
        sends POST ./user/update {
            session { id, token },
            user { email, displayName, preferences }
        }
    server does:
        gets user from session
        if (user not exists):
            return { success: false, notAuthorized: true }
        else:
            update user in database
            return { success: true }
    */
    async update ({ user }, context) {
        let { database } = this.infrastructure

        if (!context.user) {
            return { success: false, notAuthorized: true }
        }

        let userRules = UserModel.rules
        let mutableFields = ["email", "displayName", "preferences"]
        let newUser = filterFields(user, mutableFields)

        let theUser = await database.user.query().where("id", context.user.id).first()

        if (!theUser) {
            return { success: false, notFound: true }
        }

        if (Object.hasOwn(newUser, "email")) {
            if (!userRules.email.test(newUser.email)) return { success: false, bad: ["email"] }
        } 

        if (Object.hasOwn(newUser, "displayName")) {
            newUser.displayName = userRules.displayName.clamp(newUser.displayName)
        }

        await database.user.query().where("id", context.user.id).patch(newUser)

        return {
            success: true,
            user: { id: context.user.id }
        }
    }

    /*
    assume context = { user { id } }
    client does:
        sends POST ./user/updatepass {
            session { id, token },
            user { password, passwordNew }
        }
    server does:
        gets user from session
        if (user not exists):
            return { success: false, notAuthorized: true }
        else if (password not match):
            return { success: false, bad: "password" }
        else:
            update user in database
            return { success: true }
    */
    async updatePass ({ user }, context) {
        let { database } = this.infrastructure

        if (!context.user) {
            return { success: false, notAuthorized: true }
        }

        let theUser = await database.user.query().where("id", context.user.id).first()

        if (!theUser) {
            return { success: false, notFound: true }
        }

        let oldPasswordOk = !theUser.passwordHash || (theUser.passwordHash == await hash(user.password))
        if (!oldPasswordOk) {
            return { success: false, bad: "password" }
        }

        await database.user.query().where("id", context.user.id).patch({
            passwordHash: await hash(user.passwordNew)
        })

        return { success: true }
    }


    /*
    Get user's own profile
    client does:
        sends POST ./user/whoami {
            session { id, token }
        }
    server does:
        if (session not valid or not authorized):
            return { success: false, notAuthorized: true }
        else:
            get user id by session
            get user by user id
            return { success: true, user: { ...User } }
    */
    async whoami ({ session }) {
        let reqSessionOk = session && session.id && session.token
        if (!reqSessionOk) return { success: false, notAuthorized: true }
        
        let theUser = await this.parent.auth.getUser({ session, wholeUser: true })
        if (!theUser) return { success: false, notAuthorized: true }

        theUser.passwordHash = undefined
        return { success: true, user: theUser }
    }

    /*
    Get user's profile by id or username
    client does:
        sends POST ./user/find {
            session { id, token },
            user { id, userName }
        }
    server does:
        let user = null
        if (id provided):
            user = get user by id
        if (user is null): 
            user = get user by userName
        if (user is null):
            return { success: false, notFound: true }
        else:
            return { success: true, user: { id, email, userName, displayName, createdAt } }
    */
    async find ({ user }, context) {
        let requestOk = user && (user.id || user.userName)
        if (!requestOk) return { success: false, bad: ["id", "userName"] }

        let { database } = this.infrastructure
        let theUser = null
        if (user.id) {
            theUser = await database.user.query().where("id", user.id).first()
        }
        if (!theUser && user.userName) {
            theUser = await database.user.query().where("userName", user.userName).first()
        }
        if (!theUser) {
            return { success: false, notFound: true }
        }

        return {
            success: true,
            user: {
                id: theUser.id,
                email: theUser.email,
                userName: theUser.userName,
                displayName: theUser.displayName,
                createdAt: theUser.createdAt
            }
        }
    }

}