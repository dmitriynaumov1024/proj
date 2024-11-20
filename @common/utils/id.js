let NODE = typeof window === "undefined" || typeof process === "object"

import { Buffer } from "node:buffer"
import crypto from "node:crypto"

const alphabet = {
    base10: Buffer.from("0123456789"),
    base16: Buffer.from("0123456789abcdef"),
    base32: Buffer.from("23456789abcdefghijkmnpqrstuvwxyz"),
}

export function base32id (length) {
    let values = crypto.getRandomValues(Buffer.allocUnsafe(length))
    return values.map(n => alphabet.base32[n & 31]).toString()
}

export function base16id (length) {
    let values = crypto.getRandomValues(Buffer.allocUnsafe(length))
    return values.map(n => alphabet.base16[n & 15]).toString()
}

export const hexoid = base16id

export function base10id (length) {
    let values = crypto.getRandomValues(Buffer.allocUnsafe(length))
    return values.map(n => alphabet.base10[n % 10]).toString()
}
