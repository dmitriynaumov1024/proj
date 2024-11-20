import crypto from "node:crypto"

const HASH_ALGO = "SHA-512"
const HASH_CYCLES = 10

export async function hash (input) {
    if (input === null || input === undefined || input === "") return input
    let stage = input
    for (let i=0; i<HASH_CYCLES; i++) {
        stage = await crypto.subtle.digest(HASH_ALGO, stage)
    }
    return Buffer.from(stage).toString("base64")
}
