import { EventEmitter } from "node:events"
import { SystemUnit } from "./__base.js"
import { Auth } from "./auth.js"
import { User } from "./user.js"
import { Project } from "./project.js"
import { ProjectInvolvement } from "./projectInvolvement.js"

export class System extends SystemUnit 
{ 
    constructor (options) {
        super(options)
        this.events = new EventEmitter()
        options = Object.assign({ }, options)
        options.props = Object.assign({ }, options.props, { parent: this, events: this.events })
        this.auth = new Auth(options)
        this.user = new User(options)
        this.project = new Project(options)
        this.projectInvolvement = new ProjectInvolvement(options)
    }
}
