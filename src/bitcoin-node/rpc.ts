import { FeeEstimateResponse } from "../bitcoin_types";

const OPTIONS = {
  method: "POST",
  headers: { 'content-type': 'text/plain' },
  body: '' 
};
function getUrl(rpcUrl:string) {
  return `http://${rpcUrl}`;
}

export async function handleError (response:any, message:string) {
  if (response?.status !== 200) {
    const result = await response.json();
    console.log('==========================================================================');
    if (result?.error?.code) console.log(message + ' : ' + result.error.code + ' : ' + result.error.message);
    else console.log(message, result.error);
    console.log('==========================================================================');
    throw new Error(message);
  }
}

export async function startScantxoutset(rpcUrl:string, address:string) {
  const addressInfo:any = await getAddressInfo(rpcUrl, address);
  let dataString = `{"jsonrpc":"1.0","id":"curltext","method":"scantxoutset","params":["start", ["raw(${addressInfo.scriptPubKey})"]]}`;
  OPTIONS.body = dataString;
  fetch(getUrl(rpcUrl), OPTIONS);

  dataString = `{"jsonrpc":"1.0","id":"curltext","method":"scantxoutset","params":["status"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'scantxoutset not found');
  const result = await response.json();
  return result.result;
}

export async function getBlockChainInfo(rpcUrl:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockchaininfo","params":[]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'Receive by address error: ');
  const result = await response.json();
  return result.result;
}

export async function getBlockHeader(rpcUrl:string, hash:string, verbosity:boolean) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockheader","params":["${hash}", ${verbosity}]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'getBlockHeader error: ');
  const result = await response.json();
  return result.result;
}

export async function getBlock(rpcUrl:string, hash:string, verbosity:number) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblock","params":["${hash}", ${verbosity}]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'getBlock error: ');
  const result = await response.json();
  return result.result;
}

export async function getTxOutProof(rpcUrl:string, txs:Array<string>, blockhash:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"gettxoutproof","params":["${txs}", ${blockhash}]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'getTxOutProof error: ');
  const result = await response.json();
  return result.result;
}

export async function getBlockCount(rpcUrl:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockcount","params":[]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'Receive by address error: ');
  const result = await response.json();
  return { count: result.result };
}

export async function sendRawTxRpc(rpcUrl:string, hex:string, maxFeeRate:number):Promise<any> {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"sendrawtransaction","params":["${hex}", ${maxFeeRate}]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  const result = await response.text();
  return result;
}

export async function fetchRawTxRpc(rpcUrl:string, txid:string, verbose:boolean) {
  let dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getrawtransaction","params":["${txid}", ${verbose}]}`;
  OPTIONS.body = dataString; 
  let res;
  try {
    const response = await fetch(getUrl(rpcUrl), OPTIONS);
    //await handleError(response, 'fetchRawTransaction not found');
    const result = await response.json();
    res = result.result;
  } catch (err) {}
  return res;
}

/**
export async function readPayloadData(txid:string) {
  if (!txid) return
  const txHex = await fetchTransactionHex(txid);
  const tx = await fetchTransaction(txid);
  //console.log('readPayloadData:tx: ', tx);
  const block = await getBlock(tx.status.block_hash, 1);
  //console.log('readPayloadData:block: ', block);
  const txIndex = block.tx.findIndex((id) => id === txid)
  const payload:PayloadType = parsePayloadFromTransaction(getConfig().network, txHex);
  payload.txIndex = txIndex
  payload.burnBlockHeight = tx.status.block_height
  payload.burnBlockTime = tx.status.block_time
  return payload;
}
 */

export async function createWallet(rpcUrl:string, wallet:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"createwallet","params":["${wallet}", false, true, "devnet", false, true, true, false]}`;
  OPTIONS.body = dataString;
  console.log('listWallets: ' + getUrl(rpcUrl))
  console.log('listWallets: OPTIONS:', OPTIONS)
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  console.log('listWallets: response', response)
  await handleError(response, 'createWallet internal error');
  const result = await response.json();
  return result;
}

export async function listUnspent(rpcUrl:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listunspent","params":[3, 6, []]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'Unspent not found');
  const result = await response.json();
  return result.result;
}

export async function validateAddress(rpcUrl:string, address:string) {
  //checkAddressForNetwork(getConfig().network, address)
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"validateaddress","params":["${address}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'Unspent not found');
  const result = await response.json();
  return result.result;
}

export async function estimateSmartFee(rpcUrl:string): Promise<FeeEstimateResponse> {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"estimatesmartfee","params":[6]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'Fee info not found');
  const result = await response.json();
  const feeRate = result.result.feerate * 100000000; // to go to sats
  return {
    feeInfo: {
		  low_fee_per_kb: feeRate / 2,
		  medium_fee_per_kb: feeRate,
		  high_fee_per_kb: feeRate * 2
	  }
  };
}

export async function listReceivedByAddress(rpcUrl:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listreceivedbyaddress","params":[3, false, true]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'Receive by address error: ');
  const result = await response.json();
  return result.result;
}

export async function listWallets(rpcUrl:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listwallets","params":[]}`;
  OPTIONS.body = dataString;
  console.log('listWallets: ' + getUrl(rpcUrl))
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'listWallets internal error');
  const result = await response.json();
  return result;
}

export async function unloadWallet(rpcUrl:string, name:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"unloadwallet","params":["${name}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'unloadWallet internal error');
  const result = await response.json();
  return result;
}

export async function loadWallet(rpcUrl:string, name:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"loadwallet","params":["${name}", true]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  console.log('loadWallet: ', response)
  await handleError(response, 'loadWallet internal error');
  const result = await response.json();
  return result.result;
}

export async function generateNewAddress(rpcUrl:string, addressType:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getnewaddress","params":["${addressType}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  console.log('generateNewAddress: ', response)
  await handleError(response, 'generateNewAddress internal error');
  const result = await response.json();
  return result.result;
}

export async function walletProcessPsbt(rpcUrl:string, psbtHex:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"walletprocesspsbt","params":["${psbtHex}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'getAddressInfo internal error');
  const result = await response.json();
  return result.result;
}

export async function getAddressInfo(rpcUrl:string, address:string) {
  //checkAddressForNetwork(getConfig().network, address)
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getaddressinfo","params":["${address}"]}`;
  OPTIONS.body = dataString;
  console.log('getAddressInfo: ' + getUrl(rpcUrl))
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'getAddressInfo internal error: ' + address);
  const result = await response.json();
  return result.result;
}

export async function importAddress(rpcUrl:string, address:string) {
  //checkAddressForNetwork(getConfig().network, address)
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"importaddress","params":["${address}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'importAddress internal error: ' + address);
  const result = await response.json();
  return result.result;
}

export async function importPubkey(rpcUrl:string, pubkey:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"importpubkey","params":["${pubkey}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'importPubkey internal error: ' + pubkey);
  const result = await response.json();
  return result.result;
}

export async function getWalletInfo(rpcUrl:string, pubkey:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getwalletinfo","params":[]}`;
  OPTIONS.body = dataString;
  const response = await fetch(getUrl(rpcUrl), OPTIONS);
  await handleError(response, 'getWalletInfo internal error: ' + pubkey);
  const result = await response.json();
  return result.result;
}

