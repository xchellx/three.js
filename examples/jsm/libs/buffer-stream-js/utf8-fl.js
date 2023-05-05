import { TextEncoder, TextDecoder } from "./text-coder.js";
import { ensureStatic, ensureValue, ensureType, getProp } from "./utils.js";



function Utf8() {
    ensureStatic("Utf8");
}

function Utf8_static_encode(str) {
    ensureValue("str", str);
    ensureType("str", str, "string");
    
    return new TextEncoder().encode(str);
}
Object.defineProperty(Utf8, "encode", getProp(Utf8_static_encode, true));

function Utf8_static_decode(data) {
    ensureValue("data", data);
    ensureType("data", data, Uint8Array, "Uint8Array");
    
    return new TextDecoder().decode(data);
}
Object.defineProperty(Utf8, "decode", getProp(Utf8_static_decode, true));

function Utf8_toString() {
    return "Utf8";
}
Object.defineProperty(Utf8.prototype, "toString", getProp(Utf8_toString, true));

Object.defineProperty(Utf8.prototype, Symbol.toStringTag, getProp("Utf8", true));



export { Utf8 };
