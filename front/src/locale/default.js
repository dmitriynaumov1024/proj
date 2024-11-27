export default {
    error: {
        notAuthorized: "error.notAuthorized",
        notFound: "error.notFound",
        badRequest: "error.badRequest",
        usernameExists: "error.usernameExists",
        badFields: fields=> `error.badFields (${fields.join(", ")})`,
        other: "error.other",
    },
    app: {
        name: "app.name",
    },
    common: {
        loading: "common.loading"
    },
    action: {
        edit: "action.edit",
        cancel: "action.cancel",
        proceed: "action.proceed",
        retry: "action.retry",
        update: "action.update",
        save: "action.save",
        reset: "action.reset",
        login: "action.login",
        signup: "action.signup",
        create: "action.create",
        search: "action.search",
    },
    user: {
        self: "user.self",
        plural: "user.plural",
        nothing: "user.nothing",
        discover: "user.discover",
        searchByUserName: "user.searchByUserName",
        profile: "user.profile",
        ownProfile: "user.ownProfile",
        userName: "user.userName",
        displayName: "user.displayName",
        email: "user.email",
        password: "user.password",
        oldPassword: "user.oldPassword",
        newPassword: "user.newPassword",
        createdAt: "user.createdAt",
        preferences: {
            self: "user.preferences.self",
            alwaysShortCode: "user.preferences.alwaysShortCode"
        },
    },
    welcome: {
        header: "welcome.header",
    },
    signup: {
        userName: "signup.userName",
        displayName: "signup.displayName",
        email: "signup.email",
        haveAccount: "signup.haveAccount",
        successfulSignup: "signup.successfulSignup",
        nowLogin: username=> `signup.nowLogin (${username})`,
        goToLogin: "signup.goToLogin",
    },
    login: {
        haveNoAccount: "login.haveNoAccount",
        startOver: "login.startOver",
        sendAgain: "login.sendAgain",
        loginWithAnotherName: "login.loginWithAnotherName",
        shortCodeSent: "login.shortCodeSent",
        notReceiveShortCode: "login.notReceiveShortCode",
        successfulLogin: "login.successfulLogin",
    },
    project: {
        self: "project.self",
        plural: "project.plural",
        nothing: "project.nothing",
        title: "project.title",
        owner: "project.owner",
        description: "project.description",
        createdAt: "project.createdAt",
        invitedAt: "project.invitedAt",
        acceptedAt: "project.acceptedAt",
        interactedAt: "project.interactedAt",
        permission: {
            self: "project.permission.self",
            none: "project.permission.none",
            read: "project.permission.read",
            comment: "project.permission.comment",
            edit: "project.permission.edit",
            admin: "project.permission.admin",
            owner: "project.permission.owner"
        }
    }
}
