import crypto from "node:crypto"

// random id of fixed length: 8 bytes
function getRandomId() {
    return crypto.randomBytes(8).toString("hex")
}

export {
    getRandomId
}
