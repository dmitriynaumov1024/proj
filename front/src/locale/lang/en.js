export default {
    error: {
        notAuthorized: "You are not authorized to perform this action.",
        notFound: "We can not find what you are looking for.",
        badRequest: "Server could not process this request.",
        usernameExists: "This username is already taken. Try something else.",
        badFields: fields=> `Fields (${fields.join(", ")}) contain invalid values.`,
        other: "Something went wrong.",
    },
    app: {
        name: "Proj",
    },
    common: {
        loading: "Loading, please wait...",
    },
    action: {
        edit: "Edit",
        cancel: "Cancel",
        proceed: "Proceed",
        retry: "Retry",
        update: "Update",
        save: "Save",
        reset: "Reset",
        logout: "Log out",
        login: "Log in",
        signup: "Sign up",
        create: "Create",
        search: "Search",
    },
    user: {
        self: "User",
        plural: "Users",
        nothing: "No users so far...",
        discover: "Discover users",
        searchByUserName: "Search by username",
        profile: "Profile",
        ownProfile: "My profile",
        userName: "Username",
        displayName: "Display name",
        email: "Email",
        password: "Password",
        oldPassword: "Old password",
        newPassword: "New password",
        createdAt: "Signed up on",
        preferences: {
            self: "Preferences",
            alwaysShortCode: "Always log in with short code"
        },
    },
    welcome: {
        header: "Welcome to Proj!",
    },
    signup: {
        userName: "Your unique username - required",
        displayName: "Display name: how to call you? - optional",
        email: "Email address to send confirmation codes and system notifications - required",
        haveAccount: "Already have an account?",
        successfulSignup: "You have successfully signed up.",
        nowLogin: username=> `Now you can log in with username = ${username}`,
        goToLogin: "Go to Login page",
    },
    login: {
        haveNoAccount: "First time?",
        startOver: "Start over",
        sendAgain: "Send again",
        loginWithAnotherName: "Log in with another username?",
        shortCodeSent: "Short code was sent to your email",
        notReceiveShortCode: "Did not receive code?",
        successfulLogin: "You successfully logged in. Wait for redirection.",
    },
    logout: {
        header: "Log out",
        confirmation: "Do you really wish to log out?",
    },
    project: {
        self: "Project",
        plural: "Projects",
        nothing: "No projects so far...",
        title: "Title",
        owner: "Owner",
        description: "Description",
        createdAt: "Created on",
        invitedAt: "Invited on",
        acceptedAt: "Accepted on",
        interactedAt: "Interacted on",
        addUser: "Add user",
        goToWorkspace: "Go to workspace",
        permission: {
            self: "Permission level",
            none: "None",
            view: "View",
            comment: "Comment",
            edit: "Edit",
            admin: "Admin",
            owner: "Owner"
        }
    },
    workspace: {
        self: "Project workspace"
    }
}
