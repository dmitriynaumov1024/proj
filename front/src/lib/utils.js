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

// timestamp milliseconds precision
// timezone milliseconds precision as well
// returns hh:mm without a zone
export function timestampToHHMM(timestampUTC, timezone) {
    let date = new Date(timestampUTC + timezone),
        mm = date.getUTCMinutes().toString().padStart(2, "0"),
        hh = date.getUTCHours().toString().padStart(2, "0")
    return `${hh}:${mm}`
}

// timestamp milliseconds precision
// timezone milliseconds precision as well
// returns hh:mm [[+|-]hhz:mmz|UTC]
export function timestampToHHMMz(timestampUTC, timezone) {
    let date = new Date(timestampUTC + timezone),
        offset = new Date(Math.abs(timezone)),
        mm = date.getUTCMinutes().toString().padStart(2, "0"),
        hh = date.getUTCHours().toString().padStart(2, "0")
    if (Math.abs(timezone) < 1000) return `${hh}:${mm} UTC`

    let mmz = offset.getUTCMinutes().toString().padStart(2, "0"),
        hhz = offset.getUTCHours().toString(),
        signz = (timezone < 0)? "-" : "+"
    return `${hh}:${mm} ${signz}${hhz}:${mmz}`
}

// convert timestamp to day month year
// if locale is provided, returns DD Month YYYY
// if no locale, returns DD/MM/YYYY
export function timestampToDayMonthYear(timestampUTC, timezone, locale) {
    let date = new Date(timestampUTC + timezone||0),
        day = date.getUTCDate(),
        month = date.getUTCMonth(),
        year = date.getUTCFullYear()
    if (locale?.month) return `${day} ${locale.month[month]} ${year}`
    else return `${day}/${month+1}/${year}`
}

// extract date component from timestamp 
export function days(timestampUTC, timezone = 0) {
    timestampUTC += timezone
    return Math.floor(timestampUTC / 86400000)
}

// our own cursed timezone format 
// milliseconds difference between UTC and local time
export function getTimeZone() {
    let a = new Date()
    return -60000 * a.getTimezoneOffset()
}
