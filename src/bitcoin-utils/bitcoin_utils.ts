
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';

function getVersionAsType(version:string) {
    if (version === '0x00') return 'pkh'
    else if (version === '0x01') return 'sh'
    else if (version === '0x04') return 'wpkh'
    else if (version === '0x05') return 'wsh'
    else if (version === '0x06') return 'tr'
  }
  const ADDRESS_VERSION_P2PKH =new Uint8Array([0])
  const ADDRESS_VERSION_P2SH = new Uint8Array([1])
  const ADDRESS_VERSION_P2WPKH = new Uint8Array([2])
  const ADDRESS_VERSION_P2WSH = new Uint8Array([3])
  const ADDRESS_VERSION_NATIVE_P2WPKH = new Uint8Array([4])
  const ADDRESS_VERSION_NATIVE_P2WSH = new Uint8Array([5])
  const ADDRESS_VERSION_NATIVE_P2TR = new Uint8Array([6])
  
  export function getAddressFromHashBytes(netowrk:string, hashBytes:string, version:string) {
    const net = (netowrk === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK
    if (!version.startsWith('0x')) version = '0x' + version
    if (!hashBytes.startsWith('0x')) hashBytes = '0x' + hashBytes
    let btcAddr:string|undefined;
    try {
      const txType = getVersionAsType(version)
      let outType:any;
      if (txType === 'tr') {
        outType = {
          type: getVersionAsType(version),
          pubkey: hex.decode(hashBytes.split('x')[1])
        }
      } else {
        outType = {
          type: getVersionAsType(version),
          hash: hex.decode(hashBytes.split('x')[1])
        }
      }
      const addr:any = btc.Address(net);
      btcAddr = addr.encode(outType)
      return btcAddr
    } catch (err:any) {
      btcAddr = err.message
      console.error('getAddressFromHashBytes: version:hashBytes: ' + version + ':' + hashBytes)
    }
    return btcAddr
  }
  
  export function getHashBytesFromAddress(netowrk:string, address:string):{version:string, hashBytes:string }|undefined {
    const net = (netowrk === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK
    let outScript:any;
    try {
      const addr:any = btc.Address(net);
      //const outScript = btc.OutScript.encode(addr.decode(address));
      const s = btc.OutScript.encode(addr.decode(address))
      const outScript = btc.OutScript.decode(s);
      if (outScript.type === "ms") {
        return
      } else if (outScript.type === "pkh") {
        return { version: hex.encode(ADDRESS_VERSION_P2PKH), hashBytes: hex.encode(outScript.hash) }
      } else if (outScript.type === "sh") {
        return { version: hex.encode(ADDRESS_VERSION_P2SH), hashBytes: hex.encode(outScript.hash) }
      } else if (outScript.type === "wpkh") {
        return { version: hex.encode(ADDRESS_VERSION_NATIVE_P2WPKH), hashBytes: hex.encode(outScript.hash) }
      } else if (outScript.type === "wsh") {
        return { version: hex.encode(ADDRESS_VERSION_NATIVE_P2WSH), hashBytes: hex.encode(outScript.hash) }
      } else if (outScript.type === "tr") {
        return { version: hex.encode(ADDRESS_VERSION_NATIVE_P2TR), hashBytes: hex.encode(outScript.pubkey) }
      }
      return
    } catch (err:any) {
      console.error('getPartialStackedByCycle: ' + outScript)
    }
    return
  }
  