import { defineRoutes } from "@/lib/router.js"

import IndexPage from "@/pages/index.js"
import IntroPage from "@/pages/intro.js"

import LoginPage from "@/pages/login.js"
import SignupPage from "@/pages/signup.js"
import MyProfilePage from "@/pages/user/me.js"
import UserListPage from "@/pages/user/list.js"
import UserInfoPage from "@/pages/user/info.js"

import ProjectListPage from "@/pages/project/list.js"
import ProjectInfoPage from "@/pages/project/info.js"
import ProjectWorkspacePage from "@/pages/project/workspace.js"

import NotFoundPage from "@/pages/__notfound.js"

export const routes = defineRoutes([
    // index pages
    { path: "/", component: IndexPage },
    { path: "/index", component: IndexPage },
    { path: "/intro", component: IntroPage },
    // user profile related pages
    { path: "/login", component: LoginPage },
    { path: "/signup", component: SignupPage },
    { path: "/register", component: SignupPage },
    { path: "/me", component: MyProfilePage },
    { path: "/user/discover", component: UserListPage, props: { query: String } },
    { path: "/user/info/:userName", component: UserInfoPage, props: { userName: String } },
    // project pages
    { path: "/project/list", component: ProjectListPage, props: { page: Number } },
    { path: "/project/info/:id", component: ProjectInfoPage, props: { id: String } },
    { path: "/project/workspace/:id", component: ProjectWorkspacePage, props: { id: String } },
    // fallback
    { path: "/:path(.*)", component: NotFoundPage, props: { path: String } },
])
