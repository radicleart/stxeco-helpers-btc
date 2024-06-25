"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressFromHashBytes = getAddressFromHashBytes;
exports.getHashBytesFromAddress = getHashBytesFromAddress;
const btc = __importStar(require("@scure/btc-signer"));
const base_1 = require("@scure/base");
function getVersionAsType(version) {
    if (version === '0x00')
        return 'pkh';
    else if (version === '0x01')
        return 'sh';
    else if (version === '0x04')
        return 'wpkh';
    else if (version === '0x05')
        return 'wsh';
    else if (version === '0x06')
        return 'tr';
}
const ADDRESS_VERSION_P2PKH = new Uint8Array([0]);
const ADDRESS_VERSION_P2SH = new Uint8Array([1]);
const ADDRESS_VERSION_P2WPKH = new Uint8Array([2]);
const ADDRESS_VERSION_P2WSH = new Uint8Array([3]);
const ADDRESS_VERSION_NATIVE_P2WPKH = new Uint8Array([4]);
const ADDRESS_VERSION_NATIVE_P2WSH = new Uint8Array([5]);
const ADDRESS_VERSION_NATIVE_P2TR = new Uint8Array([6]);
function getAddressFromHashBytes(netowrk, hashBytes, version) {
    const net = (netowrk === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
    if (!version.startsWith('0x'))
        version = '0x' + version;
    if (!hashBytes.startsWith('0x'))
        hashBytes = '0x' + hashBytes;
    let btcAddr;
    try {
        const txType = getVersionAsType(version);
        let outType;
        if (txType === 'tr') {
            outType = {
                type: getVersionAsType(version),
                pubkey: base_1.hex.decode(hashBytes.split('x')[1])
            };
        }
        else {
            outType = {
                type: getVersionAsType(version),
                hash: base_1.hex.decode(hashBytes.split('x')[1])
            };
        }
        const addr = btc.Address(net);
        btcAddr = addr.encode(outType);
        return btcAddr;
    }
    catch (err) {
        btcAddr = err.message;
        console.error('getAddressFromHashBytes: version:hashBytes: ' + version + ':' + hashBytes);
    }
    return btcAddr;
}
function getHashBytesFromAddress(netowrk, address) {
    const net = (netowrk === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
    let outScript;
    try {
        const addr = btc.Address(net);
        //const outScript = btc.OutScript.encode(addr.decode(address));
        const s = btc.OutScript.encode(addr.decode(address));
        const outScript = btc.OutScript.decode(s);
        if (outScript.type === "ms") {
            return;
        }
        else if (outScript.type === "pkh") {
            return { version: base_1.hex.encode(ADDRESS_VERSION_P2PKH), hashBytes: base_1.hex.encode(outScript.hash) };
        }
        else if (outScript.type === "sh") {
            return { version: base_1.hex.encode(ADDRESS_VERSION_P2SH), hashBytes: base_1.hex.encode(outScript.hash) };
        }
        else if (outScript.type === "wpkh") {
            return { version: base_1.hex.encode(ADDRESS_VERSION_NATIVE_P2WPKH), hashBytes: base_1.hex.encode(outScript.hash) };
        }
        else if (outScript.type === "wsh") {
            return { version: base_1.hex.encode(ADDRESS_VERSION_NATIVE_P2WSH), hashBytes: base_1.hex.encode(outScript.hash) };
        }
        else if (outScript.type === "tr") {
            return { version: base_1.hex.encode(ADDRESS_VERSION_NATIVE_P2TR), hashBytes: base_1.hex.encode(outScript.pubkey) };
        }
        return;
    }
    catch (err) {
        console.error('getPartialStackedByCycle: ' + outScript);
    }
    return;
}
