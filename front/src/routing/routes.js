import { defineRoutes } from "../lib/router.js"

import IndexPage from "../pages/index.js"
import LoginPage from "../pages/login.js"

export const routes = defineRoutes([
    { path: "/", component: IndexPage },
    { path: "/login", component: LoginPage }
])
