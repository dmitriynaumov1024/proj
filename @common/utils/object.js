export function filterFields (object, fields) {
    let result = { }
    for (let key of fields) {
        if (Object.hasOwn(object, key)) result[key] = object[key]
    }
    return result
}

function _nestedAssign (target, source) {
    if (source instanceof Object) for (const key in source) {
        const val = source[key]
        if ((val instanceof Function) || (val instanceof Date) || !(val instanceof Object)) {
            target[key] = val
        }
        else {
            if (!(target[key] instanceof Object)) target[key] = { }
            _nestedAssign(target[key], val)
        }
    }
    return target
}

// assigns to first object and returns it
export function nestedAssign (target, ...items) {
    let result = target
    for (let item of items) {
        result = _nestedAssign(target, item)
    }
    return result
}

// merges into a new object and returns it
export function nestedMerge (...items) {
    return nestedAssign ({ }, ...items) 
}

// creates a copy of object using nested assign algorithm
export function nestedClone (source) {
    return nestedAssign ({ }, source)
}

