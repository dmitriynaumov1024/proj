import { Buffer } from "node:buffer"
import crypto from "node:crypto"

const HASH_ALGO = "SHA-512"
const HASH_CYCLES = 10

export async function hash (input) {
    if (input === null || input === undefined || input === "") return input
    let stage = input
    if (typeof stage == "string") stage = new TextEncoder().encode(stage)
    for (let i=0; i<HASH_CYCLES; i++) {
        stage = await crypto.subtle.digest(HASH_ALGO, stage)
    }
    return Buffer.from(stage).toString("base64")
}

const HASH1_ALGO = "SHA-256"

// hash and get result as uint32 LE at [0]
export async function hash1n (input) {
    if (input === null || input === undefined || input === "") return 0
    if (typeof input == "string") input = new TextEncoder().encode(input)
    return Buffer.from(await crypto.subtle.digest(HASH1_ALGO, input)).readUInt32LE()
}

// hash and get result as hex string
export async function hash1hex (input) {
    if (input === null || input === undefined) input = ""
    if (typeof input == "string") input = new TextEncoder().encode(input)
    return Buffer.from(await crypto.subtle.digest(HASH1_ALGO, input)).hexSlice()
}
