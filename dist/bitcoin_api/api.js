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
exports.fetchCurrentFeeRates = fetchCurrentFeeRates;
exports.sendRawTxDirectBlockCypher = sendRawTxDirectBlockCypher;
exports.fetchBitcoinTipHeight = fetchBitcoinTipHeight;
exports.fetchBlockByHash = fetchBlockByHash;
exports.fetchBlockByHashWithTransactionIds = fetchBlockByHashWithTransactionIds;
exports.fetchBlockByHashWithTransactions = fetchBlockByHashWithTransactions;
exports.fetchBlockAtHeight = fetchBlockAtHeight;
exports.fetchTransactionHex = fetchTransactionHex;
exports.fetchTransaction = fetchTransaction;
exports.fetchAddress = fetchAddress;
exports.fetchAddressTransactions = fetchAddressTransactions;
exports.fetchAddressTransactionsMin = fetchAddressTransactionsMin;
exports.fetchUtxosForAddress = fetchUtxosForAddress;
exports.fetchUTXOs = fetchUTXOs;
exports.readTx = readTx;
exports.sendRawTxDirectMempool = sendRawTxDirectMempool;
function fetchCurrentFeeRates(mempoolUrl, blockCypherUrl, network) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (network === "devnet") {
                const url = mempoolUrl + "/v1/mining/blocks/fee-rates/1m";
                const response = yield fetch(url);
                const info = yield response.json();
                return {
                    feeInfo: {
                        low_fee_per_kb: info[0].avgFee_100,
                        medium_fee_per_kb: info[1].avgFee_100,
                        high_fee_per_kb: info[2].avgFee_100,
                    },
                };
            }
            else {
                const url = blockCypherUrl;
                const response = yield fetch(url);
                const info = yield response.json();
                return {
                    feeInfo: {
                        low_fee_per_kb: info.low_fee_per_kb,
                        medium_fee_per_kb: info.medium_fee_per_kb,
                        high_fee_per_kb: info.high_fee_per_kb,
                    },
                };
            }
        }
        catch (err) {
            console.log("fetchCurrentFeeRates: " + err.message);
            return {
                feeInfo: {
                    low_fee_per_kb: 2000,
                    medium_fee_per_kb: 3000,
                    high_fee_per_kb: 4000,
                },
            };
        }
    });
}
function sendRawTxDirectBlockCypher(blockCypherUrl, hex) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = blockCypherUrl + "/txs/push";
        //console.log('sendRawTxDirectBlockCypher: ', url)
        const response = yield fetch(url, {
            method: "POST",
            //headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tx: hex }),
        });
        //if (response.status !== 200) console.log('Mempool error: ' + response.status + ' : ' + response.statusText);
        try {
            return yield response.json();
        }
        catch (err) {
            try {
                console.log(err);
                return yield response.text();
            }
            catch (err1) {
                console.log(err1);
            }
        }
        return "success";
    });
}
function fetchBitcoinTipHeight(mempoolUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = mempoolUrl + "/blocks/tip/height";
            const response = yield fetch(url);
            const hex = yield response.text();
            return hex;
        }
        catch (err) {
            console.log(err);
            return;
        }
    });
}
function fetchBlockByHash(mempoolUrl, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let url = `${mempoolUrl}/block/${hash}`;
            let response = yield fetch(url);
            const block = yield response.json();
            return block;
        }
        catch (error) {
            console.error("Error fetching block timestamp:", error);
        }
    });
}
function fetchBlockByHashWithTransactionIds(mempoolUrl, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let url = `${mempoolUrl}/block/${hash}/txids`;
            let response = yield fetch(url);
            const block = yield response.json();
            return block;
        }
        catch (error) {
            console.error("Error fetching block timestamp:", error);
        }
    });
}
function fetchBlockByHashWithTransactions(mempoolUrl, hash, start_index) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let url = `${mempoolUrl}/block/${hash}/txs/${start_index}`;
            let response = yield fetch(url);
            const block = yield response.json();
            return block;
        }
        catch (error) {
            console.error("Error fetching block timestamp:", error);
        }
    });
}
function fetchBlockAtHeight(mempoolUrl, height) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let url = `${mempoolUrl}/block-height/${height}`;
            let response = yield fetch(url);
            const blockHash = yield response.text();
            url = `${mempoolUrl}/block/${blockHash}`;
            response = yield fetch(url);
            const block = yield response.json();
            return block;
        }
        catch (error) {
            console.error("Error fetching block timestamp:", error);
        }
    });
}
function fetchTransactionHex(mempoolUrl, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //https://api.blockcypher.com/v1/btc/test3/txs/<txID here>?includeHex=true
            //https://mempool.space/api/tx/15e10745f15593a899cef391191bdd3d7c12412cc4696b7bcb669d0feadc8521/hex
            const url = mempoolUrl + "/tx/" + txid + "/hex";
            const response = yield fetch(url);
            const hex = yield response.text();
            return hex;
        }
        catch (err) {
            console.log(err);
            return;
        }
    });
}
function fetchTransaction(mempoolUrl, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = mempoolUrl + "/tx/" + txid;
            const response = yield fetch(url);
            if (response.status !== 200)
                throw new Error("fetchTransaction: Unable to fetch transaction for: " + txid);
            const tx = yield response.json();
            return tx;
        }
        catch (err) {
            console.log(err);
            return;
        }
    });
}
function fetchAddress(mempoolUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = mempoolUrl + "/address/" + address;
        const response = yield fetch(url);
        const result = yield response.json();
        return result;
    });
}
function fetchAddressTransactions(mempoolUrl, address, txId) {
    return __awaiter(this, void 0, void 0, function* () {
        const urlBase = mempoolUrl + "/address/" + address + "/txs";
        let url = urlBase;
        if (txId) {
            url = urlBase + "/chain/" + txId;
        }
        console.log("fetchAddressTransactions: url: " + url);
        let response;
        let allResults = [];
        let results;
        let fetchMore = true;
        do {
            try {
                response = yield fetch(url);
                results = yield response.json();
                if (results && results.length > 0) {
                    console.log("fetchAddressTransactions: " +
                        results.length +
                        " found at " +
                        results[results.length - 1].status.block_height);
                    url = urlBase + "/chain/" + results[results.length - 1].txid;
                    allResults = allResults.concat(results);
                }
                else {
                    fetchMore = false;
                }
            }
            catch (err) {
                console.error("fetchAddressTransactions" + err.message);
                fetchMore = false;
            }
        } while (fetchMore);
        console.log("fetchAddressTransactions: total of " +
            allResults.length +
            " found at " +
            address);
        return allResults;
    });
}
function fetchAddressTransactionsMin(mempoolUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = mempoolUrl + "/address/" + address + "/txs";
        const response = yield fetch(url);
        const result = yield response.json();
        return result;
    });
}
function fetchUtxosForAddress(electrumUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = electrumUrl + "/address/" + address + "/utxo";
        console.log("fetchUtxoSetDevnet: fetchUtxosForAddress" + url);
        const response = yield fetch(url);
        const result = yield response.json();
        return result;
    });
}
function fetchUTXOs(mempoolUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // this will work on test/main net but not devnet
            const url = mempoolUrl + "/address/" + address + "/utxo";
            const response = yield fetch(url);
            //if (response.status !== 200) throw new Error('Unable to retrieve utxo set from mempool?');
            const result = yield response.json();
            return result;
        }
        catch (err) {
            console.log(err);
            return;
        }
    });
}
function readTx(mempoolUrl, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = mempoolUrl + "/tx/" + txid;
        const response = yield fetch(url);
        const result = yield response.json();
        let error = "";
        try {
            return result.vout;
        }
        catch (err) {
            error = err.message;
        }
        throw new Error(error);
    });
}
function sendRawTxDirectMempool(mempoolUrl, hex) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = mempoolUrl + "/tx";
        console.log("sendRawTxDirectMempool: ", url);
        const response = yield fetch(url, {
            method: "POST",
            //headers: { 'Content-Type': 'application/json' },
            body: hex,
        });
        let result;
        if (response.status !== 200)
            throw new Error("Mempool error: " + response.status + " : " + response.statusText);
        try {
            result = yield response.json();
        }
        catch (err) {
            result = yield response.text();
        }
        return result;
    });
}
