"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
exports.startScantxoutset = startScantxoutset;
exports.getBlockChainInfo = getBlockChainInfo;
exports.getBlockHeader = getBlockHeader;
exports.getBlock = getBlock;
exports.getTxOutProof = getTxOutProof;
exports.getBlockCount = getBlockCount;
exports.sendRawTxRpc = sendRawTxRpc;
exports.fetchRawTxRpc = fetchRawTxRpc;
exports.createWallet = createWallet;
exports.listUnspent = listUnspent;
exports.validateAddress = validateAddress;
exports.estimateSmartFee = estimateSmartFee;
exports.listReceivedByAddress = listReceivedByAddress;
exports.listWallets = listWallets;
exports.unloadWallet = unloadWallet;
exports.loadWallet = loadWallet;
exports.generateNewAddress = generateNewAddress;
exports.walletProcessPsbt = walletProcessPsbt;
exports.getAddressInfo = getAddressInfo;
exports.importAddress = importAddress;
exports.importPubkey = importPubkey;
exports.getWalletInfo = getWalletInfo;
const OPTIONS = {
    method: "POST",
    headers: { 'content-type': 'text/plain' },
    body: ''
};
function getUrl(rpcUrl) {
    return `http://${rpcUrl}`;
}
function handleError(response, message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if ((response === null || response === void 0 ? void 0 : response.status) !== 200) {
            const result = yield response.json();
            console.log('==========================================================================');
            if ((_a = result === null || result === void 0 ? void 0 : result.error) === null || _a === void 0 ? void 0 : _a.code)
                console.log(message + ' : ' + result.error.code + ' : ' + result.error.message);
            else
                console.log(message, result.error);
            console.log('==========================================================================');
            throw new Error(message);
        }
    });
}
function startScantxoutset(rpcUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const addressInfo = yield getAddressInfo(rpcUrl, address);
        let dataString = `{"jsonrpc":"1.0","id":"curltext","method":"scantxoutset","params":["start", ["raw(${addressInfo.scriptPubKey})"]]}`;
        OPTIONS.body = dataString;
        fetch(getUrl(rpcUrl), OPTIONS);
        dataString = `{"jsonrpc":"1.0","id":"curltext","method":"scantxoutset","params":["status"]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'scantxoutset not found');
        const result = yield response.json();
        return result.result;
    });
}
function getBlockChainInfo(rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockchaininfo","params":[]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'Receive by address error: ');
        const result = yield response.json();
        return result.result;
    });
}
function getBlockHeader(rpcUrl, hash, verbosity) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockheader","params":["${hash}", ${verbosity}]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'getBlockHeader error: ');
        const result = yield response.json();
        return result.result;
    });
}
function getBlock(rpcUrl, hash, verbosity) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblock","params":["${hash}", ${verbosity}]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'getBlock error: ');
        const result = yield response.json();
        return result.result;
    });
}
function getTxOutProof(rpcUrl, txs, blockhash) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"gettxoutproof","params":["${txs}", ${blockhash}]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'getTxOutProof error: ');
        const result = yield response.json();
        return result.result;
    });
}
function getBlockCount(rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockcount","params":[]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'Receive by address error: ');
        const result = yield response.json();
        return { count: result.result };
    });
}
function sendRawTxRpc(rpcUrl, hex, maxFeeRate) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"sendrawtransaction","params":["${hex}", ${maxFeeRate}]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        const result = yield response.text();
        return result;
    });
}
function fetchRawTxRpc(rpcUrl, txid, verbose) {
    return __awaiter(this, void 0, void 0, function* () {
        let dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getrawtransaction","params":["${txid}", ${verbose}]}`;
        OPTIONS.body = dataString;
        let res;
        try {
            const response = yield fetch(getUrl(rpcUrl), OPTIONS);
            //await handleError(response, 'fetchRawTransaction not found');
            const result = yield response.json();
            res = result.result;
        }
        catch (err) { }
        return res;
    });
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
function createWallet(rpcUrl, wallet) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"createwallet","params":["${wallet}", false, true, "devnet", false, true, true, false]}`;
        OPTIONS.body = dataString;
        console.log('listWallets: ' + getUrl(rpcUrl));
        console.log('listWallets: OPTIONS:', OPTIONS);
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        console.log('listWallets: response', response);
        yield handleError(response, 'createWallet internal error');
        const result = yield response.json();
        return result;
    });
}
function listUnspent(rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listunspent","params":[3, 6, []]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'Unspent not found');
        const result = yield response.json();
        return result.result;
    });
}
function validateAddress(rpcUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        //checkAddressForNetwork(getConfig().network, address)
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"validateaddress","params":["${address}"]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'Unspent not found');
        const result = yield response.json();
        return result.result;
    });
}
function estimateSmartFee(rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"estimatesmartfee","params":[6]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'Fee info not found');
        const result = yield response.json();
        const feeRate = result.result.feerate * 100000000; // to go to sats
        return {
            feeInfo: {
                low_fee_per_kb: feeRate / 2,
                medium_fee_per_kb: feeRate,
                high_fee_per_kb: feeRate * 2
            }
        };
    });
}
function listReceivedByAddress(rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listreceivedbyaddress","params":[3, false, true]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'Receive by address error: ');
        const result = yield response.json();
        return result.result;
    });
}
function listWallets(rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listwallets","params":[]}`;
        OPTIONS.body = dataString;
        console.log('listWallets: ' + getUrl(rpcUrl));
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'listWallets internal error');
        const result = yield response.json();
        return result;
    });
}
function unloadWallet(rpcUrl, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"unloadwallet","params":["${name}"]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'unloadWallet internal error');
        const result = yield response.json();
        return result;
    });
}
function loadWallet(rpcUrl, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"loadwallet","params":["${name}", true]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        console.log('loadWallet: ', response);
        yield handleError(response, 'loadWallet internal error');
        const result = yield response.json();
        return result.result;
    });
}
function generateNewAddress(rpcUrl, addressType) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getnewaddress","params":["${addressType}"]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        console.log('generateNewAddress: ', response);
        yield handleError(response, 'generateNewAddress internal error');
        const result = yield response.json();
        return result.result;
    });
}
function walletProcessPsbt(rpcUrl, psbtHex) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"walletprocesspsbt","params":["${psbtHex}"]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'getAddressInfo internal error');
        const result = yield response.json();
        return result.result;
    });
}
function getAddressInfo(rpcUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        //checkAddressForNetwork(getConfig().network, address)
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getaddressinfo","params":["${address}"]}`;
        OPTIONS.body = dataString;
        console.log('getAddressInfo: ' + getUrl(rpcUrl));
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'getAddressInfo internal error: ' + address);
        const result = yield response.json();
        return result.result;
    });
}
function importAddress(rpcUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        //checkAddressForNetwork(getConfig().network, address)
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"importaddress","params":["${address}"]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'importAddress internal error: ' + address);
        const result = yield response.json();
        return result.result;
    });
}
function importPubkey(rpcUrl, pubkey) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"importpubkey","params":["${pubkey}"]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'importPubkey internal error: ' + pubkey);
        const result = yield response.json();
        return result.result;
    });
}
function getWalletInfo(rpcUrl, pubkey) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getwalletinfo","params":[]}`;
        OPTIONS.body = dataString;
        const response = yield fetch(getUrl(rpcUrl), OPTIONS);
        yield handleError(response, 'getWalletInfo internal error: ' + pubkey);
        const result = yield response.json();
        return result.result;
    });
}
