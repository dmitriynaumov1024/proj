import defaultPage from "./default.js"
import notFoundPage from "./notfound.js"
import usersPage from "./users.js"
import taskListPage from "./task.list.js"
import settingsProjectPage from "./settings.project.js"
import settingsTaskStatusPage from "./settings.taskstatus.js"
import settingsPluginsPage from "./settings.plugins.js"

// re-export all known pages
export default {
    default: defaultPage,
    notfound: notFoundPage,
    users: usersPage,
    task: {
        list: taskListPage
    },
    settings: {
        project: settingsProjectPage,
        taskstatus: settingsTaskStatusPage,
        plugins: settingsPluginsPage
    }
}
