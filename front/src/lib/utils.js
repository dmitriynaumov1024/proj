import { hash1n } from "common/utils/hash"

// const colors = [
//     0xfe88fe,
//     0xf4fe99,
//     0x4c99ff,
//     0x45ddee,
//     0xf08888,
//     0x34d095
// ]

const colors = [
    0x215499,
    0x672199,
    0x883277,
    0x225854,
    0x233655
]

const idColorCache = { } 

export async function idToColor (id) {
    if (idColorCache[id]) return idColorCache[id]

    let hash = await hash1n(String(id))

    let L = ((hash >>> 3) + 23) % 4
    let color = colors[((hash >>> 8) + 17) % colors.length]
    console.log(color.toString(16))

    let red = (((color >> 16) & 0xff)*(12+L) + 0xf7*(4-L)) >>> 4
    let green = (((color >> 8) & 0xff)*(12+L) + 0xf7*(4-L)) >>> 4
    let blue = (((color) & 0xff)*(12+L) + 0xf7*(4-L)) >>> 4

    let result = `rgb(${red}, ${green}, ${blue})`
    idColorCache[id] = result

    return result
}

export function sleep (ms) {
    return new Promise((resolve)=> setTimeout(()=> resolve(), ms))
}
