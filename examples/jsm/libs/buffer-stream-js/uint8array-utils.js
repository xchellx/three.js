import { ensureStatic, ensureValue, ensureType, getProp } from "./utils.js";



function Uint8ArrayUtils() {
    ensureStatic("Uint8ArrayUtils");
}

function Uint8ArrayUtils_static_equals(a, b) {
    ensureValue("a", a);
    ensureType("a", a, Uint8Array, "Uint8Array");
    
    ensureValue("b", b);
    ensureType("b", b, Uint8Array, "Uint8Array");
    
    if (a.length != b.length)
        return false;
    
    for (let i = 0; i < a.length; i++)
        if (a[i] != b[i])
            return false;
    
    return true;
}
Object.defineProperty(Uint8ArrayUtils, "equals", getProp(Uint8ArrayUtils_static_equals, true));

function Uint8ArrayUtils_static_concat(arrays) {
    ensureValue("arrays", arrays);
    ensureType("arrays", arrays, Uint8Array, "array");
    
    let length = 0;
    for (let x of arrays) {
        ensureValue("x of arrays", x);
        ensureType("x of arrays", x, Uint8Array, "Uint8Array");
        length += x.byteLength;
    }
    
    const res = new Uint8Array(length);
    let offset = 0;
    for (let x of arrays) {
        res.set(x, offset);
        offset += x.byteLength;
    }
    return res;
}
Object.defineProperty(Uint8ArrayUtils, "concat", getProp(Uint8ArrayUtils_static_concat, true));

function Uint8ArrayUtils_static_compare(a, b) {
    ensureValue("a", a);
    ensureType("a", a, Uint8Array, "Uint8Array");
    
    ensureValue("b", b);
    ensureType("b", b, Uint8Array, "Uint8Array");
    
    for (let i = 0; i < a.length && i < b.length; i++) {
        let res = a[i] - b[i];
        if (res != 0)
            return res < 0 ? -1 : 1;
    }
    
    return a.length == b.length ? 0 : (a.length < b.length ? -1 : 1);
}
Object.defineProperty(Uint8ArrayUtils, "compare", getProp(Uint8ArrayUtils_static_compare, true));

function Uint8ArrayUtils_static_cast(buffer) {
    ensureValue("buffer", buffer);
    
    if (buffer instanceof Uint8Array)
        return buffer;
    else if (buffer instanceof ArrayBuffer)
        return new Uint8Array(buffer);
    else if (ArrayBuffer.isView(buffer))
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    
    throw new Error("Invalid buffer");
}
Object.defineProperty(Uint8ArrayUtils, "cast", getProp(Uint8ArrayUtils_static_cast, true));

function Uint8ArrayUtils_static_arrayLike(data) {
    ensureValue("data", data);
    
    return Array.isArray(data) ? data : Uint8ArrayUtils.cast(data);
}
Object.defineProperty(Uint8ArrayUtils, "arrayLike", getProp(Uint8ArrayUtils_static_arrayLike, true));

function Uint8ArrayUtils_toString() {
    return "Uint8ArrayUtils";
}
Object.defineProperty(Uint8ArrayUtils.prototype, "toString", getProp(Uint8ArrayUtils_toString, true));

Object.defineProperty(Uint8ArrayUtils.prototype, Symbol.toStringTag, getProp("Uint8ArrayUtils", true));



export { Uint8ArrayUtils };
