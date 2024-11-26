export function createHttpClient (apiBaseUrl, initSession) {
    let session = initSession ?? { }
    let timediff = null
    let busy = { }

    async function doPost(topic, params) {
        if (busy[topic]) {
            return
        }
        params ??= { }
        try {
            params.session = Object.assign({ }, session, params.session) 
            busy[topic] = true
            let result = await fetch(apiBaseUrl + topic, { 
                method: "POST", 
                headers: { "Content-Type": "application/json; chatset=utf-8" },
                body: JSON.stringify(Object.assign({ }, params)) 
            })
            result = await result.json()
            if (result.session) Object.assign(session, result.session)
            return result 
        }
        catch (error) {
            console.error(error)
            return { error }
        }
        finally {
            busy[topic] = false
        }
    }

    return {
        get session() {
            return session
        },
        set session(value) {
            session = value
        },
        async hasValidSession() {
            if (!this.timediff) await this.timesync()
            if (session?.refreshAt > Date.now() + this.timediff) return true
            let result = session? await doPost("/auth/ping", { }) : { }
            if (result.session?.id) return true
        },
        async isLoggedIn() {
            return await this.hasValidSession() 
        },
        async timesync () {
            let result = await doPost("/utils/time", { })
            if (result.time) timediff = result.time - Date.now()
        },
        async beginAuth ({ userName }) {
            return await doPost("/auth/begin", {
                user: { userName }
            })
        },
        async completeAuth ({ shortCode, password }) {
            return await doPost("/auth/complete", {
                session: { id: session.id },
                user: { shortCode, password }
            })
        },
        async refreshAuth () {
            return await doPost("/auth/ping", {
                session: { id: session.id, token: session.token } 
            })
        },
        async invoke (topic, params) {
            if (timediff == null) {
                await this.timesync()
            }
            if (session.refreshAt < Date.now()+timediff) {
                await this.refreshAuth()
            }
            return await doPost(topic, params)
        }
    }
}
