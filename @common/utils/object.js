export function filterFields (object, fields) {
    let result = { }
    for (let key of fields) {
        if (Object.hasOwn(object, key)) result[key] = object[key]
    }
    return result
}
