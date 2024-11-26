function makeProvider (obj, serviceNames, getServiceFunc) {
    let result = { }
    for (let key of serviceNames) {
        // lazy service provider 
        Object.defineProperty(result, key, { get() { return getServiceFunc.call(obj, key) } })
    }
    return result
}

export class SystemUnit 
{
    getService (name) {
        let result = this.__services[name]
        if (result instanceof Function) result = result()
        return result
    }

    constructor ({ services, props } = { }) {
        Object.assign(this, props)
        this.__services = Object.assign({ }, this.__services, services)
        this.services = makeProvider(this, Object.keys(services), this.getService)
        this.infrastructure = this.services
    }
}
