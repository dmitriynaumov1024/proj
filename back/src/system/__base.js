function makeProvider (obj, serviceNames) {
    let result = { }
    for (let key of serviceNames) {
        // lazy service provider 
        Object.defineProperty(result, key, { get() { return obj.getService(key) } })
    }
    return result
}

export class SystemUnit 
{
    getService (name) {
        let result = this.services[name]
        if (result instanceof Function) result = result()
        return result
    }

    constructor ({ services, parent } = { }) {
        this.parent = parent
        this.services = Object.assign({ }, this.services, services)
        this.infrastructure = makeProvider(this, Object.keys(services))
    }
}
