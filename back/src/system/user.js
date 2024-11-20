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
}
