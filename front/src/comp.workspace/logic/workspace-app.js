import { markRaw as m } from "vue"
import * as ico from "@/comp.icon/index.js"
import pages from "../pages/index.js"
const defaultRoute = "index"
const notFoundRoute = "notFound"

const WorkspaceAppMenu = ()=> ([
    {
        name: "Tasks",
        items: [
            { name: "Task list", icon: m(ico.TaskListIcon), route: "task.list" },
            { name: "Task board", icon: m(ico.TaskBoardIcon), route: "task.board" },
        ]
    },
    {
        name: "Collaboration",
        items: [
            { name: "Users", icon: m(ico.PersonIcon), route: "users" },
            // { name: "Groups", icon: m(ico.PersonGroupIcon), route: "groups" }
        ]
    },
    {
        name: "Settings",
        items: [
            { name: "Project settings", icon: m(ico.Gear6Icon), route: "settings.project" },
            { name: "Task fields", icon: m(ico.TaskIcon), route: "settings.taskfields"  },
            { name: "Task states", icon: m(ico.ActivityIcon), route: "settings.taskstatus" },
            { name: "Plugins", icon: m(ico.CodeIcon), route: "settings.plugins" }
        ]
    }
])

const WorkspaceAppPages = ()=> ({
    [defaultRoute]: m(pages.default),
    [notFoundRoute]: m(pages.notfound),
    "users": m(pages.users),
    "settings.project": m(pages.settings.project),
    "settings.taskfields": m(pages.settings.taskfields),
    "settings.taskstatus": m(pages.settings.taskstatus),
    "settings.plugins": m(pages.settings.plugins),
    "task.list": m(pages.task.list),
    "task.board": m(pages.task.board),
})

import { nestedAssign } from "common/utils/object"
import { base16id } from "common/utils/id"
import { TaskObjectType as TOType } from "common/wsp/enums"
import { timestampToHHMM, timestampToDayMonthYear, days } from "@/lib/utils.js"

const WorkspaceAppDataSources = ()=> ({
    id: {
        convertItem (item) { 
            return item 
        },
        restoreItem (value) {
            return { value }
        },
        getItems () { 
            return null
        },
        getDefault () {
            return { value: base16id(24) }
        }
    },
    taskSetIds: {
        convertItem (item) {
            if (!item) return { value: null, text: "null" }
            return { value: item?.id, text: item?.title }
        },
        restoreItem (value) {
            let result = this.project.data.taskObjects[value]
            if (result?.type == TOType.TaskSet) return result 
            return null
        },
        getItems () {
            return Object.values(this.project.data.taskObjects)
                         .filter(o=> o.type==TOType.TaskSet)
        },
        getDefault () {
            return null
        }
    },
    userIds: {
        convertItem (user) {
            return { 
                value: user?.id, 
                text: user ? `${user.displayName} @${user.userName}` : "-"
            }
        },
        restoreItem (value) {
            return this.project.data.users[value]
        },
        getItems () {
            return Object.values(this.project.data.users)
        },
        getDefault () {
            return this.user
        }
    },
    taskStatuses: {
        convertItem (status) {
            return { value: status?.name, text: status?.name }
        },
        restoreItem (value) {
            let entry = [value, this.project.data.taskStatuses[value]]
            return { name: entry[0], index: entry[1]?.index, value: entry[1]?.value }
        },
        getItems () {
            return Object.entries(this.project.data.taskStatuses)
                .sort((a, b)=> a[1].index - b[1].index)
                .map(([name, { index, value }])=> ({ name, index, value }))
        },
        getDefault () {
            let item = Object.entries(this.project.data.taskStatuses)
                .sort((a, b)=> a[1].index - b[1].index).at(0)
            if (!item) return null
            return {
                name: item[0],
                index: item[1].index,
                value: item[1].value,
            }
        }
    },
    timestamp: {
        convertItem (item) {
            return item
        },
        restoreItem (value) {
            return { value: value, text: `${timestampToDayMonthYear(value, this.app?.tz??0)} ${timestampToHHMM(value, this.app?.tz??0)}` }
        },
        getDefault () {
            let value = Date.now()
            return { value: value, text: `${timestampToDayMonthYear(value, this.app?.tz??0)} ${timestampToHHMM(value, this.app?.tz??0)}` }
        }
    }
})

const WorkspaceAppMethods = ()=> ({
    createTaskObject (type) {
        let result = { }
        let project = this.project.data
        let fields = project.taskFields[type]
        if (!fields) return result
        for (let field of [...Object.values(fields.primary), ...Object.values(fields.secondary)]) {
            if (field.dataSource) {
                let ds = this.app.dataSources[field.dataSource]
                result[field.name] = ds.convertItem(ds.getDefault.call(this)).value
            }
            else {
                result[field.name] = field.default
            }
        }
        result.type = type
        return result
    }
})

export default {
    menu: WorkspaceAppMenu,
    pages: WorkspaceAppPages,
    methods: WorkspaceAppMethods,
    dataSources: WorkspaceAppDataSources
}
