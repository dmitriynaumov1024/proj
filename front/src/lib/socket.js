let sockets = { }

function createRawSocket(id) {
    let socket = new WebSocket(`wss://${window.location.host}/`)
    sockets[id] = socket
    return socket
}

function disposeRawSocket(id) {
    sockets[id]?.close()
}

export function createSocket(id, connectTimeout) {
    disposeRawSocket(id)
    let connectTimeoutHandle = null
    let socket = createRawSocket(id)
    let handlers = { }
    socket.addEventListener("message", (message)=> {
        let wrappedMessage = JSON.parse(message.data)
        let topicHandlers = handlers[wrappedMessage.type]
        if (topicHandlers) for (let handler of topicHandlers) {
            if (handler instanceof Function) {
                handler(wrappedMessage.data, wrappedMessage)
            }
        }
    })
    let socket2 = {
        get raw() { return socket },
        send: (...args)=> {
            let wrappedMessage = (args.length >= 2)? 
                ({ type: args[0], data: args[1] }) : args[0] 
            socket.send(JSON.stringify(Object.assign({ }, wrappedMessage)))
        },
        on: (type, handler)=> {
            handlers[type] ??= [ ]
            handlers[type].push(handler)
        },
        ready: ()=> new Promise((resolve, reject)=> {
            if (socket?.readyState === WebSocket.CONNECTING) {
                socket.addEventListener("open", ()=> resolve())
            }
            else if (socket?.readyState === WebSocket.OPEN) {
                resolve()
            }
            else {
                console.log("reconnecting...")
                disposeRawSocket(id)
                socket = createRawSocket(id)
                socket.addEventListener("message", (message)=> {
                    let wrappedMessage = JSON.parse(message.data)
                    let topicHandlers = handlers[wrappedMessage.type]
                    if (topicHandlers) for (let handler of topicHandlers) {
                        if (handler instanceof Function) {
                            handler(wrappedMessage.data, wrappedMessage)
                        }
                    }
                })
                socket.addEventListener("open", ()=> { clearTimeout(connectTimeoutHandle); resolve() })
                connectTimeoutHandle = setTimeout(()=> reject(), connectTimeout ?? 5000)
            }
        })
    }
    return socket2
}

