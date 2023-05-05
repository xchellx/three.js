function ensureStatic(n) {
    throw new Error(`${n} is a static class and therefore not callable`);
}

function ensureNew(n, o) {
    if (typeof (o ?? undefined) === "undefined")
        throw new Error(`Please initialize ${n} with new`);
}

function ensureValue(n, o) {
    if (typeof (o ?? undefined) === "undefined")
        throw new Error(`${n} cannot be null or undefined`);
}

function ensureType(n, o, t, tn) {
    if (typeof t === "string") {
        if (t === "int" && (!(typeof o === "number") || !Number.isInteger(o)))
            throw new Error(`${n} must be a number that fits in an integer`);
        else if (t === "array" && !Array.isArray(o))
            throw new Error(`${n} must be an Array`);
        else if (t === "array-buffer" && (Array.isArray(o) || !(o instanceof ArrayBuffer)))
            throw new Error(`${n} must be an ArrayBuffer`);
        else if (t === "array-buffer-view" && !ArrayBuffer.isView(o))
            throw new Error(`${n} must be an ArrayBuffer View`);
        else if (t !== "int" && t !== "array" && t !== "array-buffer" && t !== "array-buffer-view" && (typeof o !== t))
            throw new Error(`${n} must be of primitive type ${t}`);
    } else if (!(o instanceof t))
        throw new Error(`${n} must be of type ${(t.name ?? tn ?? "Unknown")}`)
}

function getProp(v, e, w, c) {
    return {
        "value": v,
        "writable": w ?? false,
        "configurable": c ?? false,
        "enumerable": e ?? false
    };
}

export { ensureStatic, ensureNew, ensureValue, ensureType, getProp };
