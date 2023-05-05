import { ensureNew, ensureValue, ensureType, getProp } from "./utils.js";

const utf8Encodings = [
  'utf8',
  'utf-8',
  'unicode-1-1-utf-8'
];



function TextEncoder(encoding) {
    ensureNew("TextEncoder", new.target);
    
    ensureType("encoding", encoding ?? "utf-8", "string");
    
    if (utf8Encodings.indexOf(encoding ?? "utf-8") < 0)
        throw new RangeError("Invalid encoding type. Only utf-8 is supported");
    
    this.encoding = "utf-8";
}

function TextEncoder_encode(str) {
    ensureValue("str", str);
    ensureType("str", str, "string");
    
    const binstr = unescape(encodeURIComponent(str));
    const arr = new Uint8Array(binstr.length);
    const split = binstr.split("");
    for (let i = 0; i < split.length; i++)
        arr[i] = split[i].charCodeAt(0);
    return arr;
}
Object.defineProperty(TextEncoder.prototype, "encode", getProp(TextEncoder_encode, true));

function TextEncoder_toString() {
    return "TextEncoder";
}
Object.defineProperty(TextEncoder.prototype, "toString", getProp(TextEncoder_toString, true));

Object.defineProperty(TextEncoder.prototype, Symbol.toStringTag, getProp("TextEncoder", true));



function TextDecoder(encoding, options) {
    ensureNew("TextDecoder", new.target);
    
    ensureType("encoding", encoding ?? "utf-8", "string");
    
    ensureType("options", options ?? {}, "object");
    
    if (utf8Encodings.indexOf(encoding ?? "utf-8") < 0)
        throw new RangeError("Invalid encoding type. Only utf-8 is supported");
    
    this.fatal = options?.fatal ?? false;
    this.ignoreBOM = options?.ignoreBOM ?? false;
    this.encoding = "utf-8";
}

function TextDecoder_decode(view, options) {
    ensureValue("view", view);
    ensureType("view", view, "array-buffer-view");
    
    ensureType("options", options ?? {}, "object");
    
    ensureType("options.stream", options?.stream ?? false, "boolean");
    
    const arr = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    const charArr = new Array(arr.length);
    for (let i = 0; i < arr.length; i++)
        charArr[i] = String.fromCharCode(arr[i]);
    return decodeURIComponent(escape(charArr.join('')));
}
Object.defineProperty(TextDecoder.prototype, "decode", getProp(TextDecoder_decode, true));

function TextDecoder_toString() {
    return "TextDecoder";
}
Object.defineProperty(TextDecoder.prototype, "toString", getProp(TextDecoder_toString, true));

Object.defineProperty(TextDecoder.prototype, Symbol.toStringTag, getProp("TextDecoder", true));



export { TextEncoder, TextDecoder };
