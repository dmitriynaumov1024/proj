// dashboard-plugin@0.0.1
// created by create-proj-plugin

import { h } from "vue"
import { markRaw as m } from "vue"

import DashboardPage from "./Dashboard.vue"

const myCircleIcon = ()=> h("svg", { viewBox: "0 0 10 10" }, [
  h("circle", { cx: 5, cy: 5, r: 4, stroke: "#fe8923", "stroke-width": "1.8", fill: "none", })
])  

export default {
    mount (app) {
        let route = "dashboard.td"
        let submenu = app.menu.find(category => category.name == "View")
        if (!submenu) {
            submenu = { name: "View", items: [] }
            app.menu.unshift(submenu)
        }
        submenu.items.push({ name: "Dashboard", route: route, icon: m(myCircleIcon) })
        app.pages[route] = m(DashboardPage)
    }
}

import "./style.scss"

