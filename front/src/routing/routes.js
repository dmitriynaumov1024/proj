import { defineRoutes } from "../lib/router.js"

import IndexPage from "../pages/index.js"
import IntroPage from "../pages/intro.js"
import LoginPage from "../pages/login.js"
import SignupPage from "../pages/signup.js"
import MyProfilePage from "../pages/me.js"
import NotFoundPage from "../pages/__notfound.js"

export const routes = defineRoutes([
    { path: "/", component: IndexPage },
    { path: "/index", component: IndexPage },
    { path: "/intro", component: IntroPage },
    { path: "/login", component: LoginPage },
    { path: "/signup", component: SignupPage },
    { path: "/register", component: SignupPage },
    { path: "/me", component: MyProfilePage },
    { path: "/:path(.*)", component: NotFoundPage, props: { path: String } }
])
