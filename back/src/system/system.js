import { SystemUnit } from "./__base.js"

import { Auth } from "./auth.js"
import { User } from "./user.js"

export class System extends SystemUnit 
{ 
    constructor (options) {
        super(options)
        options = Object.assign({ }, options, { parent: this })
        this.auth = new Auth(options)
        this.user = new User(options)
    }
}
