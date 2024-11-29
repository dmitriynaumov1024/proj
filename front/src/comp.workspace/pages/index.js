import defaultPage from "./default.js"
import notFoundPage from "./notfound.js"
import usersPage from "./users.js"
import settingsPage from "./settings.js"

// re-export all known pages
export default {
    default: defaultPage,
    notfound: notFoundPage,
    users: usersPage,
    settings: settingsPage 
}
