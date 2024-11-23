import { defineRoutes } from "../lib/router.js"

import MainPage from "../pages/main.js"
import ProjectPage from "../pages/project.js"

export const routes = defineRoutes([
    { path: "/", component: MainPage },
    { path: "/project", component: ProjectPage }
])
