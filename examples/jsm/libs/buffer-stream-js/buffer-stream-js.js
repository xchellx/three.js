import { Utf8 } from "./utf8-fl.js";
import { Uint8ArrayUtils } from "./uint8array-utils.js";
import { ensureNew, ensureValue, ensureType, getProp } from "./utils.js";



function BufferStreamOptions(options) {
    ensureNew("BufferStreamOptions", new.target);
    
    ensureType("offset", options?.offset ?? 0, "number");
    Object.defineProperty(this, "offset", getProp(options?.offset ?? 0, true));
    
    ensureType("allowExtend", options?.allowExtend ?? true, "boolean");
    Object.defineProperty(this, "allowExtend", getProp(options?.allowExtend ?? true, true));
    
    ensureType("newSizeGetter", options?.newSizeGetter ?? ((currentSize, additionalLength, stream) => {}), "function");
    Object.defineProperty(this, "newSizeGetter", getProp(options?.newSizeGetter ?? null, true));
    
    ensureType("extendFactory", options?.extendFactory ?? 1024, "number");
    Object.defineProperty(this, "extendFactory", getProp(options?.extendFactory ?? 1024, true));
}

// instance

function BufferStreamOptions_toString() {
    return "BufferStreamOptions";
}
Object.defineProperty(BufferStreamOptions.prototype, "toString", getProp(BufferStreamOptions_toString, true));

Object.defineProperty(BufferStreamOptions.prototype, Symbol.toStringTag, getProp("BufferStreamOptions", true));

// static

Object.defineProperty(BufferStreamOptions, "DEFAULT", getProp(new BufferStreamOptions(null), true));



function BufferStream(buffer, options) {
    ensureNew("BufferStream", new.target);
    
    ensureType("options", options ?? BufferStreamOptions.DEFAULT, BufferStreamOptions, "BufferStreamOptions");
    
    this.buffer = null;
    this.view = null;
    this.offset = 0;
    this.allowExtend = false;
    this.newSizeGetter = (currentSize, additionalLength, stream) => {};
    this.extendFactory = 0;
    
    this.setInternalBuffer(buffer);
    this.offset = options?.offset ?? BufferStreamOptions.DEFAULT.offset;
    this.allowExtend = options?.allowExtend ?? BufferStreamOptions.DEFAULT.allowExtend;
    this.newSizeGetter = options?.newSizeGetter ?? BufferStreamOptions.DEFAULT.newSizeGetter;
    this.extendFactory = options?.extendFactory ?? BufferStreamOptions.DEFAULT.extendFactory;
}

// instance

function BufferStream_setInternalBuffer(buffer) {
    ensureValue("buffer", buffer);
    
    this.buffer = Uint8ArrayUtils.cast(buffer);
    this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
}
Object.defineProperty(BufferStream.prototype, "setInternalBuffer", getProp(BufferStream_setInternalBuffer, true));

function BufferStream_canRead(bytes) {
    ensureValue("bytes", bytes);
    ensureType("bytes", bytes, "number");
    
    return this.offset + bytes <= this.buffer.byteLength
}
Object.defineProperty(BufferStream.prototype, "canRead", getProp(BufferStream_canRead, true));

function BufferStream_checkToRead(bytes) {
    ensureValue("bytes", bytes);
    ensureType("bytes", bytes, "number");
    
    if (!this.canRead(bytes))
        throw new Error("End of stream");
}
Object.defineProperty(BufferStream.prototype, "checkToRead", getProp(BufferStream_checkToRead, true));

function BufferStream_toRead() {
    return this.buffer.byteLength - this.offset;
}
Object.defineProperty(BufferStream.prototype, "toRead", getProp(BufferStream_toRead, true));

function BufferStream_skip(offset) {
    ensureValue("offset", offset);
    ensureType("offset", offset, "number");
    
    if (this.offset + offset < 0)
        throw new Error("Out of range");
    
    if (this.offset + offset > this.buffer.byteLength)
        this.extend(offset);
    this.offset += offset;
}
Object.defineProperty(BufferStream.prototype, "skip", getProp(BufferStream_skip, true));

function BufferStream_seek(offset) {
    ensureValue("offset", offset);
    ensureType("offset", offset, "number");
    
    if (offset < 0)
        throw new Error("Out of range");
    
    if (offset > this.buffer.byteLength)
        this.extend(offset);
    this.offset = offset;
}
Object.defineProperty(BufferStream.prototype, "seek", getProp(BufferStream_seek, true));

function BufferStream_read(length) {
    ensureValue("length", length);
    ensureType("length", length, "number");
    
    const res = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    return res;
}
Object.defineProperty(BufferStream.prototype, "read", getProp(BufferStream_read, true));

function BufferStream_readInt8() {
    this.checkToRead(1);
    const res = this.view.getInt8(this.offset);
    this.offset += 1;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readInt8", getProp(BufferStream_readInt8, true));

function BufferStream_readInt16LE() {
    this.checkToRead(2);
    const res = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readInt16LE", getProp(BufferStream_readInt16LE, true));

function BufferStream_readInt16BE() {
    this.checkToRead(2);
    const res = this.view.getInt16(this.offset, false);
    this.offset += 2;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readInt16BE", getProp(BufferStream_readInt16BE, true));

function BufferStream_readInt32LE() {
    this.checkToRead(4);
    const res = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readInt32LE", getProp(BufferStream_readInt32LE, true));

function BufferStream_readInt32BE() {
    this.checkToRead(4);
    const res = this.view.getInt32(this.offset, false);
    this.offset += 4;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readInt32BE", getProp(BufferStream_readInt32BE, true));

function BufferStream_readUInt8() {
    this.checkToRead(1);
    const res = this.view.getUint8(this.offset);
    this.offset += 1;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readUInt8", getProp(BufferStream_readUInt8, true));

function BufferStream_readUInt16LE() {
    this.checkToRead(2);
    const res = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readUInt16LE", getProp(BufferStream_readUInt16LE, true));

function BufferStream_readUInt16BE() {
    this.checkToRead(2);
    const res = this.view.getUint16(this.offset, false);
    this.offset += 2;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readUInt16BE", getProp(BufferStream_readUInt16BE, true));

function BufferStream_readUInt32LE() {
    this.checkToRead(4);
    const res = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readUInt32LE", getProp(BufferStream_readUInt32LE, true));

function BufferStream_readUInt32BE() {
    this.checkToRead(4);
    const res = this.view.getUint32(this.offset, false);
    this.offset += 4;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readUInt32BE", getProp(BufferStream_readUInt32BE, true));

function BufferStream_readFloatLE() {
    this.checkToRead(4);
    const res = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readFloatLE", getProp(BufferStream_readFloatLE, true));

function BufferStream_readFloatBE() {
    this.checkToRead(4);
    const res = this.view.getFloat32(this.offset, false);
    this.offset += 4;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readFloatBE", getProp(BufferStream_readFloatBE, true));

function BufferStream_readDoubleLE() {
    this.checkToRead(8);
    const res = this.view.getFloat64(this.offset, true);
    this.offset += 8;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readDoubleLE", getProp(BufferStream_readDoubleLE, true));

function BufferStream_readDoubleBE() {
    this.checkToRead(8);
    const res = this.view.getFloat64(this.offset, false);
    this.offset += 8;
    return res;
}
Object.defineProperty(BufferStream.prototype, "readDoubleBE", getProp(BufferStream_readDoubleBE, true));

function BufferStream_getNewBufferSize(additionalLength) {
    ensureValue("additionalLength", additionalLength);
    ensureType("additionalLength", additionalLength, "number");
    
    if (this.newSizeGetter)
        return this.newSizeGetter(this.buffer.byteLength, additionalLength, this);
    else
        return this.buffer.byteLength + Math.max(additionalLength, this.extendFactory);
}
Object.defineProperty(BufferStream.prototype, "getNewBufferSize", getProp(BufferStream_getNewBufferSize, true));

function BufferStream_extend(additionalLength) {
    ensureValue("additionalLength", additionalLength);
    ensureType("additionalLength", additionalLength, "number");
    
    if (this.offset + additionalLength <= this.buffer.byteLength)
        return;
    
    if (this.allowExtend === false)
        throw new Error("End of stream");
    
    const oldBuffer = this.buffer;
    const newSize = Math.max(this.buffer.byteLength + additionalLength, this.getNewBufferSize(additionalLength) || 0);
    this.setInternalBuffer(new Uint8Array(newSize));
    this.buffer.set(oldBuffer);
}
Object.defineProperty(BufferStream.prototype, "extend", getProp(BufferStream_extend, true));

function BufferStream_write(data) {
    ensureValue("data", data);
    
    const buffer = Uint8ArrayUtils.arrayLike(data);
    this.extend(buffer.length);
    this.buffer.set(buffer, this.offset);
    this.offset += buffer.length;
    return buffer.length;
}
Object.defineProperty(BufferStream.prototype, "write", getProp(BufferStream_write, true));

function BufferStream_writeInt8(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < -128 || data > 127)
        throw new Error("Invalid data");
    
    this.extend(1);
    this.view.setInt8(this.offset, data);
    this.offset += 1;
}
Object.defineProperty(BufferStream.prototype, "writeInt8", getProp(BufferStream_writeInt8, true));

function BufferStream_writeInt16LE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < -32768 || data > 32767)
        throw new Error("Invalid data");
    
    this.extend(2);
    this.view.setInt16(this.offset, data, true);
    this.offset += 2;
}
Object.defineProperty(BufferStream.prototype, "writeInt16LE", getProp(BufferStream_writeInt16LE, true));

function BufferStream_writeInt16BE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < -32768 || data > 32767)
        throw new Error("Invalid data");
    
    this.extend(2);
    this.view.setInt16(this.offset, data, false);
    this.offset += 2;
}
Object.defineProperty(BufferStream.prototype, "writeInt16BE", getProp(BufferStream_writeInt16BE, true));

function BufferStream_writeInt32LE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < -2147483648 || data > 2147483647)
        throw new Error("Invalid data");
    
    this.extend(4);
    this.view.setInt32(this.offset, data, true);
    this.offset += 4;
}
Object.defineProperty(BufferStream.prototype, "writeInt32LE", getProp(BufferStream_writeInt32LE, true));

function BufferStream_writeInt32BE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < -2147483648 || data > 2147483647)
        throw new Error("Invalid data");
    
    this.extend(4);
    this.view.setInt32(this.offset, data, false);
    this.offset += 4;
}
Object.defineProperty(BufferStream.prototype, "writeInt32BE", getProp(BufferStream_writeInt32BE, true));

function BufferStream_writeUInt8(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 255)
        throw new Error("Invalid data");
    
    this.extend(1);
    this.view.setUint8(this.offset, data);
    this.offset += 1;
}
Object.defineProperty(BufferStream.prototype, "writeUInt8", getProp(BufferStream_writeUInt8, true));

function BufferStream_writeUInt16LE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 65535)
        throw new Error("Invalid data");
    
    this.extend(2);
    this.view.setUint16(this.offset, data, true);
    this.offset += 2;
}
Object.defineProperty(BufferStream.prototype, "writeUInt16LE", getProp(BufferStream_writeUInt16LE, true));

function BufferStream_writeUInt16BE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 65535)
        throw new Error("Invalid data");
    
    this.extend(2);
    this.view.setUint16(this.offset, data, false);
    this.offset += 2;
}
Object.defineProperty(BufferStream.prototype, "writeUInt16BE", getProp(BufferStream_writeUInt16BE, true));

function BufferStream_writeUInt32LE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    this.extend(4);
    this.view.setUint32(this.offset, data, true);
    this.offset += 4;
}
Object.defineProperty(BufferStream.prototype, "writeUInt32LE", getProp(BufferStream_writeUInt32LE, true));

function BufferStream_writeUInt32BE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    this.extend(4);
    this.view.setUint32(this.offset, data, false);
    this.offset += 4;
}
Object.defineProperty(BufferStream.prototype, "writeUInt32BE", getProp(BufferStream_writeUInt32BE, true));

function BufferStream_writeFloatLE(data) {
    ensureValue("data", data);
    ensureType("data", data, "number");
    
    this.extend(4);
    this.view.setFloat32(this.offset, data, true);
    this.offset += 4;
}
Object.defineProperty(BufferStream.prototype, "writeFloatLE", getProp(BufferStream_writeFloatLE, true));

function BufferStream_writeFloatBE(data) {
    ensureValue("data", data);
    ensureType("data", data, "number");
    
    this.extend(4);
    this.view.setFloat32(this.offset, data, false);
    this.offset += 4
}
Object.defineProperty(BufferStream.prototype, "writeFloatBE", getProp(BufferStream_writeFloatBE, true));

function BufferStream_writeDoubleLE(data) {
    ensureValue("data", data);
    ensureType("data", data, "number");
    
    this.extend(8);
    this.view.setFloat64(this.offset, data, true);
    this.offset += 8;
}
Object.defineProperty(BufferStream.prototype, "writeDoubleLE", getProp(BufferStream_writeDoubleLE, true));

function BufferStream_writeDoubleBE(data) {
    ensureValue("data", data);
    ensureType("data", data, "number");
    
    this.extend(8);
    this.view.setFloat64(this.offset, data, false);
    this.offset += 8;
}
Object.defineProperty(BufferStream.prototype, "writeDoubleBE", getProp(BufferStream_writeDoubleBE, true));

function BufferStream_readBoolean() {
    return this.readUInt8() != 0;
}
Object.defineProperty(BufferStream.prototype, "readBoolean", getProp(BufferStream_readBoolean, true));

function BufferStream_writeBoolean(value) {
    ensureValue("value", value);
    ensureType("value", value, "boolean");
    
    this.writeUInt8(value ? 1 : 0);
}
Object.defineProperty(BufferStream.prototype, "writeBoolean", getProp(BufferStream_writeBoolean, true));

function BufferStream_readInt() {
    let res = 0;
    let first = true;
    let minus = false;
    let m = 1;
    while (true) {
        let o = this.readUInt8();
        if (first) {
            first = false;
            if (o < 128) {
                return o >= 64 ? 63 - o : o;
            }
            else {
                o = o - 128;
                minus = o >= 64;
                res += minus ? o - 63 : o;
                m *= 64;
            }
        } else {
            if (o < 128) {
                res += m * o;
                return minus ? -res : res;
            } else {
                res += m * (o - 128);
                m *= 128;
            }
        }
    }
}
Object.defineProperty(BufferStream.prototype, "readInt", getProp(BufferStream_readInt, true));

function BufferStream_writeInt(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    const startOffset = this.offset;
    const minus = data < 0;
    let first = true;
    data = minus ? -data - 1 : data;
    while (true) {
        if (first) {
            first = false;
            if (data < 64) {
                this.writeUInt8(data + (minus ? 64 : 0));
                return this.offset - startOffset;
            } else {
                const a = data % 64;
                this.writeUInt8(a + 128 + (minus ? 64 : 0));
                data = Math.floor(data / 64);
            }
        } else {
            if (data < 128) {
                this.writeUInt8(data);
                return this.offset - startOffset;
            } else {
                const a = data % 128;
                this.writeUInt8(a + 128);
                data = Math.floor(data / 128);
            }
        }
    }
}
Object.defineProperty(BufferStream.prototype, "writeInt", getProp(BufferStream_writeInt, true));

function BufferStream_readUInt() {
    let res = 0;
    let m = 1;
    while (true) {
        const o = this.readUInt8();
        if (o < 128) {
            res += m * o;
            return res;
        } else {
            res += m * (o - 128);
            m *= 128;
        }
    }
}
Object.defineProperty(BufferStream.prototype, "readUInt", getProp(BufferStream_readUInt, true));

function BufferStream_writeUInt(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0)
        throw new Error("Invalid data");
    
    const startOffset = this.offset;
    while (true) {
        if (data < 128) {
            this.writeUInt8(data);
            return this.offset - startOffset;
        } else {
            const a = data % 128;
            this.writeUInt8(a + 128);
            data = Math.floor(data / 128);
        }
    }
}
Object.defineProperty(BufferStream.prototype, "writeUInt", getProp(BufferStream_writeUInt, true));

function BufferStream_readPacked() {
    const length = this.readUInt();
    return this.read(length);
}
Object.defineProperty(BufferStream.prototype, "readPacked", getProp(BufferStream_readPacked, true));

function BufferStream_writePacked(data) {
    ensureValue("data", data);
    
    const buffer = Uint8ArrayUtils.arrayLike(data);
    const lengthSize = this.writeUInt(buffer.length);
    return lengthSize + this.write(buffer);
}
Object.defineProperty(BufferStream.prototype, "writePacked", getProp(BufferStream_writePacked, true));

function BufferStream_readUtf8String(length) {
    ensureType("length", length ?? 0, "number");
    
    let _length = length ?? 0;
    const start = this.offset;
    const autol = ((typeof (length ?? undefined) === "undefined") || length < 1);
    if (autol) {
        while (this.readUInt8() !== 0x00)
            _length++;
    }
    this.seek(start);
    
    const str = Utf8.decode(this.read(_length));
    if (autol)
        this.skip(1);
    return str;
}
Object.defineProperty(BufferStream.prototype, "readUtf8String", getProp(BufferStream_readUtf8String, true));

function BufferStream_writeUtf8String(data) {
    ensureValue("data", data);
    ensureType("data", data, "string");
    
    return this.write(Utf8.encode(data));
}
Object.defineProperty(BufferStream.prototype, "writeUtf8String", getProp(BufferStream_writeUtf8String, true));

function BufferStream_readPackedUtf8String() {
    return Utf8.decode(this.readPacked());
}
Object.defineProperty(BufferStream.prototype, "readPackedUtf8String",
    getProp(BufferStream_readPackedUtf8String, true));

function BufferStream_writePackedUtf8String(data) {
    ensureValue("data", data);
    ensureType("data", data, "string");
    
    return this.writePacked(Utf8.encode(data));
}
Object.defineProperty(BufferStream.prototype, "writePackedUtf8String",
    getProp(BufferStream_writePackedUtf8String, true));

function BufferStream_getLeftBuffer() {
    return this.buffer.subarray(0, this.offset);
}
Object.defineProperty(BufferStream.prototype, "getLeftBuffer", getProp(BufferStream_getLeftBuffer, true));

function BufferStream_getRightBuffer() {
    return this.buffer.subarray(this.offset);
}
Object.defineProperty(BufferStream.prototype, "getRightBuffer", getProp(BufferStream_getRightBuffer, true));

function BufferStream_getRightBufferAsUtf8String() {
    return Utf8.decode(this.getRightBuffer());
}
Object.defineProperty(BufferStream.prototype, "getRightBufferAsUtf8String",
    getProp(BufferStream_getRightBufferAsUtf8String, true));

function BufferStream_toString() {
    return "BufferStream";
}
Object.defineProperty(BufferStream.prototype, "toString", getProp(BufferStream_toString, true));

Object.defineProperty(BufferStream.prototype, Symbol.toStringTag, getProp("BufferStream", true));

// static

function BufferStream_static_readInt8(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readInt8();
}
Object.defineProperty(BufferStream, "readInt8", getProp(BufferStream_static_readInt8, true));

function BufferStream_static_readInt16LE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readInt16LE();
}
Object.defineProperty(BufferStream, "readInt16LE", getProp(BufferStream_static_readInt16LE, true));

function BufferStream_static_readInt16BE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readInt16BE();
}
Object.defineProperty(BufferStream, "readInt16BE", getProp(BufferStream_static_readInt16BE, true));

function BufferStream_static_readInt32LE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readInt32LE();
}
Object.defineProperty(BufferStream, "readInt32LE", getProp(BufferStream_static_readInt32LE, true));

function BufferStream_static_readInt32BE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readInt32BE();
}
Object.defineProperty(BufferStream, "readInt32BE", getProp(BufferStream_static_readInt32BE, true));

function BufferStream_static_readUInt8(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readUInt8();
}
Object.defineProperty(BufferStream, "readUInt8", getProp(BufferStream_static_readUInt8, true));

function BufferStream_static_readUInt16LE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readUInt16LE();
}
Object.defineProperty(BufferStream, "readUInt16LE", getProp(BufferStream_static_readUInt16LE, true));

function BufferStream_static_readUInt16BE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readUInt16BE();
}
Object.defineProperty(BufferStream, "readUInt16BE", getProp(BufferStream_static_readUInt16BE, true));

function BufferStream_static_readUInt32LE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readUInt32LE();
}
Object.defineProperty(BufferStream, "readUInt32LE", getProp(BufferStream_static_readUInt32LE, true));

function BufferStream_static_readUInt32BE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readUInt32BE();
}
Object.defineProperty(BufferStream, "readUInt32BE", getProp(BufferStream_static_readUInt32BE, true));

function BufferStream_static_readFloatLE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readFloatLE();
}
Object.defineProperty(BufferStream, "readFloatLE", getProp(BufferStream_static_readFloatLE, true));

function BufferStream_static_readFloatBE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readFloatBE();
}
Object.defineProperty(BufferStream, "readFloatBE", getProp(BufferStream_static_readFloatBE, true));

function BufferStream_static_readDoubleLE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readDoubleLE();
}
Object.defineProperty(BufferStream, "readDoubleLE", getProp(BufferStream_static_readDoubleLE, true));

function BufferStream_static_readDoubleBE(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readDoubleBE();
}
Object.defineProperty(BufferStream, "readDoubleBE", getProp(BufferStream_static_readDoubleBE, true));

function BufferStream_static_writeInt8(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(1);
    stream.writeInt8(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeInt8", getProp(BufferStream_static_writeInt8, true));

function BufferStream_static_writeInt16LE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(2);
    stream.writeInt16LE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeInt16LE", getProp(BufferStream_static_writeInt16LE, true));

function BufferStream_static_writeInt16BE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(2);
    stream.writeInt16BE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeInt16BE", getProp(BufferStream_static_writeInt16BE, true));

function BufferStream_static_writeInt32LE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(4);
    stream.writeInt32LE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeInt32LE", getProp(BufferStream_static_writeInt32LE, true));

function BufferStream_static_writeInt32BE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(4);
    stream.writeInt32BE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeInt32BE", getProp(BufferStream_static_writeInt32BE, true));

function BufferStream_static_writeUInt8(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(1);
    stream.writeUInt8(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeUInt8", getProp(BufferStream_static_writeUInt8, true));

function BufferStream_static_writeUInt16LE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(2);
    stream.writeUInt16LE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeUInt16LE", getProp(BufferStream_static_writeUInt16LE, true));

function BufferStream_static_writeUInt16BE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(2);
    stream.writeUInt16BE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeUInt16BE", getProp(BufferStream_static_writeUInt16BE, true));

function BufferStream_static_writeUInt32LE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(4);
    stream.writeUInt32LE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeUInt32LE", getProp(BufferStream_static_writeUInt32LE, true));

function BufferStream_static_writeUInt32BE(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    if (data < 0 || data > 4294967295)
        throw new Error("Invalid data");
    
    const stream = BufferStream.alloc(4);
    stream.writeUInt32BE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeUInt32BE", getProp(BufferStream_static_writeUInt32BE, true));

function BufferStream_static_writeFloatLE(data) {
    ensureValue("data", data);
    ensureType("data", data, "number");
    
    const stream = BufferStream.alloc(4);
    stream.writeFloatLE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeFloatLE", getProp(BufferStream_static_writeFloatLE, true));

function BufferStream_static_writeFloatBE(data) {
    ensureValue("data", data);
    ensureType("data", data, "number");
    
    const stream = BufferStream.alloc(4);
    stream.writeFloatBE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeFloatBE", getProp(BufferStream_static_writeFloatBE, true));

function BufferStream_static_writeDoubleLE(data) {
    ensureValue("data", data);
    ensureType("data", data, "number");
    
    const stream = BufferStream.alloc(8);
    stream.writeDoubleLE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeDoubleLE", getProp(BufferStream_static_writeDoubleLE, true));

function BufferStream_static_writeDoubleBE(data) {
    ensureValue("data", data);
    ensureType("data", data, "number");
    
    const stream = BufferStream.alloc(8);
    stream.writeDoubleBE(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeDoubleBE", getProp(BufferStream_static_writeDoubleBE, true));

function BufferStream_static_readBoolean(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readBoolean();
}
Object.defineProperty(BufferStream, "readBoolean", getProp(BufferStream_static_readBoolean, true));

function BufferStream_static_writeBoolean(value) {
    const stream = BufferStream.alloc(1);
    stream.writeBoolean(value);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeBoolean", getProp(BufferStream_static_writeBoolean, true));

function BufferStream_static_readInt(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readInt();
}
Object.defineProperty(BufferStream, "readInt", getProp(BufferStream_static_readInt, true));

function BufferStream_static_writeInt(data) {
    const stream = BufferStream.alloc(8);
    stream.writeInt(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeInt", getProp(BufferStream_static_writeInt, true));

function BufferStream_static_readUInt(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readUInt();
}
Object.defineProperty(BufferStream, "readUInt", getProp(BufferStream_static_readUInt, true));

function BufferStream_static_writeUInt(data) {
    ensureValue("data", data);
    ensureType("data", data, "int");
    
    const stream = BufferStream.alloc(8);
    stream.writeUInt(data);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writeUInt", getProp(BufferStream_static_writeUInt, true));

function BufferStream_static_readPacked(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readPacked();
}
Object.defineProperty(BufferStream, "readPacked", getProp(BufferStream_static_readPacked, true));

function BufferStream_static_writePacked(data) {
    ensureValue("data", data);
    
    const buffer = Uint8ArrayUtils.arrayLike(data);
    const stream = BufferStream.alloc(8 + buffer.length);
    stream.writePacked(buffer);
    return stream.getLeftBuffer();
}
Object.defineProperty(BufferStream, "writePacked", getProp(BufferStream_static_writePacked, true));

function BufferStream_static_readUtf8String(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readUtf8String(length == null ? data.byteLength : length);
}
Object.defineProperty(BufferStream, "readUtf8String", getProp(BufferStream_static_readUtf8String, true));

function BufferStream_static_writeUtf8String(data) {
    ensureValue("data", data);
    ensureType("data", data, "string");
    
    return Utf8.encode(data);
}
Object.defineProperty(BufferStream, "writeUtf8String", getProp(BufferStream_static_writeUtf8String, true));

function BufferStream_static_readPackedUtf8String(data) {
    ensureValue("data", data);
    
    return new BufferStream(data).readPackedUtf8String();
}
Object.defineProperty(BufferStream, "readPackedUtf8String", getProp(BufferStream_static_readPackedUtf8String, true));

function BufferStream_static_writePackedUtf8String(data) {
    ensureValue("data", data);
    ensureType("data", data, "string");
    
    return BufferStream.writePacked(Utf8.encode(data));
}
Object.defineProperty(BufferStream, "writePackedUtf8String", getProp(BufferStream_static_writePackedUtf8String, true));

function BufferStream_static_alloc(size, options) {
    ensureValue("size", size);
    ensureType("size", size, "number");
    
    ensureType("options", options ?? BufferStreamOptions.DEFAULT, BufferStreamOptions, "BufferStreamOptions");
    
    return new BufferStream(new Uint8Array(size), options);
}
Object.defineProperty(BufferStream, "alloc", getProp(BufferStream_static_alloc, true));



export { BufferStreamOptions, BufferStream };
