import { hash1n } from "common/utils/hash"

const colors = [
    0xfe88fe,
    0xf4fe99,
    0x4c99ff,
    0x45ddee,
    0xf08888,
    0x34d095
]

export async function idToColor (id) {
    let hash = await hash1n(String(id))
    let L = hash % 16
    let color = (hash >> 8) % colors.length
    
    let red = (((color >> 24) && 0xff)*(16+L) + 0xf7*(16-L)) >> 5
    let green = (((color >> 16) && 0xff)*(16+L) + 0xf7*(16-L)) >> 5
    let blue = (((color) && 0xff)*(16+L) + 0xf7*(16-L)) >> 5

    return `rgb(${red}, ${green}, ${blue})`
}
