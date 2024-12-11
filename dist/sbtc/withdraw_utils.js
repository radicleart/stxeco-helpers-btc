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
exports.fullfillmentFee = void 0;
exports.buildWithdrawalTransaction = buildWithdrawalTransaction;
exports.buildWithdrawTransactionOpDrop = buildWithdrawTransactionOpDrop;
exports.getBridgeWithdrawOpDrop = getBridgeWithdrawOpDrop;
exports.getBridgeWithdraw = getBridgeWithdraw;
const btc = __importStar(require("@scure/btc-signer"));
const base_1 = require("@scure/base");
const payload_utils_1 = require("./payload_utils");
const payload_utils_2 = require("./payload_utils");
const wallet_utils_1 = require("./wallet_utils");
const deposit_utils_1 = require("./deposit_utils");
const bitcoin_api_1 = require("../bitcoin_api");
exports.fullfillmentFee = 2000;
/**
 *
 * @param network
 * @param uiPayload
 * @param utxos:Array<UTXO>
 * @param btcFeeRates
 * @returns Transaction from @scure/btc-signer
 */
function buildWithdrawalTransaction(mempoolApi, network, withdrawalAddress, signature, amountSats, paymentPublicKey, paymentAddress, feeMultiplier, sbtcWalletPublicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const net = (0, wallet_utils_1.getNet)(network);
        let utxos = [];
        try {
            utxos = (yield (0, bitcoin_api_1.fetchUtxoSet)(mempoolApi, paymentAddress, true)).utxos;
        }
        catch (err) {
            console.error("=============================================================== ");
            console.error("buildWithdrawTransaction: Error fetching utxos: address: " +
                paymentAddress);
            console.error("buildWithdrawTransaction: Error fetching utxos: " + err.message);
            console.error("=============================================================== ");
            throw new Error("Unable to lookup UTXOs for address this could be a network failure or rate limiting by remote service: " +
                paymentAddress);
        }
        const sbtcWalletAddress = (0, wallet_utils_1.getPegWalletAddressFromPublicKey)(network, sbtcWalletPublicKey);
        console.log("Withdrawal: from sbtc wallet: " + sbtcWalletAddress);
        if (!signature)
            throw new Error("No signature");
        const data = buildData(network, amountSats, signature, false);
        const tx = new btc.Transaction({
            allowUnknowOutput: true,
            allowUnknownInputs: true,
            allowUnknownOutputs: true,
        });
        const fees = yield (0, bitcoin_api_1.fetchCurrentFeeRates)(mempoolApi);
        const txFee = (0, deposit_utils_1.estimateActualFee)(tx, fees.feeInfo) * feeMultiplier;
        (0, wallet_utils_1.addInputs)(network, amountSats, 0, tx, false, utxos, paymentPublicKey);
        tx.addOutput({
            script: btc.Script.encode(["RETURN", base_1.hex.decode(data)]),
            amount: BigInt(0),
        });
        const change = (0, wallet_utils_1.inputAmt)(tx) - (exports.fullfillmentFee + deposit_utils_1.dust + txFee);
        tx.addOutputAddress(withdrawalAddress, BigInt(deposit_utils_1.dust), net);
        tx.addOutputAddress(sbtcWalletAddress, BigInt(exports.fullfillmentFee), net);
        if (change > 0)
            tx.addOutputAddress(paymentAddress, BigInt(change), net);
        return { transaction: tx, txFee };
    });
}
/**
 *
 * @param network
 * @param uiPayload
 * @param utxos:Array<UTXO>
 * @param btcFeeRates
 * @param originator
 * @returns
 */
function buildWithdrawTransactionOpDrop(network, sbtcWalletPublicKey, uiPayload, utxos, btcFeeRates, originator) {
    if (!uiPayload.signature)
        throw new Error("Signature of output 2 scriptPubKey is required");
    const net = (0, wallet_utils_1.getNet)(network);
    const sbtcWalletAddress = (0, wallet_utils_1.getPegWalletAddressFromPublicKey)(network, sbtcWalletPublicKey);
    const txFees = calculateWithdrawFees(network, true, utxos, uiPayload.amountSats, btcFeeRates, sbtcWalletAddress, uiPayload.bitcoinAddress, uiPayload.paymentPublicKey, undefined);
    const tx = new btc.Transaction({
        allowUnknowOutput: true,
        allowUnknownInputs: true,
        allowUnknownOutputs: true,
    });
    (0, wallet_utils_1.addInputs)(network, uiPayload.amountSats, deposit_utils_1.revealPayment, tx, false, utxos, uiPayload.paymentPublicKey);
    const csvScript = getBridgeWithdrawOpDrop(network, sbtcWalletPublicKey, uiPayload, originator);
    //(network, data, sbtcWalletAddress, uiPayload.bitcoinAddress);
    if (!csvScript)
        throw new Error("script required!");
    tx.addOutput({ script: csvScript.commitTxScript.script, amount: BigInt(0) });
    tx.addOutputAddress(uiPayload.bitcoinAddress, BigInt(deposit_utils_1.dust), net);
    tx.addOutputAddress(sbtcWalletAddress, BigInt(exports.fullfillmentFee), net);
    const change = (0, wallet_utils_1.inputAmt)(tx) - (exports.fullfillmentFee + deposit_utils_1.dust + txFees[1]);
    if (change > 0)
        tx.addOutputAddress(uiPayload.bitcoinAddress, BigInt(change), net);
    return tx;
}
function calculateWithdrawFees(network, opDrop, utxos, amount, feeInfo, sbtcWalletAddress, changeAddress, paymentPublicKey, data) {
    try {
        let vsize = 0;
        const net = (0, wallet_utils_1.getNet)(network);
        const tx = new btc.Transaction({
            allowUnknowOutput: true,
            allowUnknownInputs: true,
            allowUnknownOutputs: true,
        });
        (0, wallet_utils_1.addInputs)(network, amount, deposit_utils_1.revealPayment, tx, true, utxos, paymentPublicKey);
        if (!opDrop) {
            if (data)
                tx.addOutput({
                    script: btc.Script.encode(["RETURN", data]),
                    amount: BigInt(0),
                });
            tx.addOutputAddress(sbtcWalletAddress, BigInt(deposit_utils_1.dust), net);
        }
        else {
            tx.addOutput({ script: sbtcWalletAddress, amount: BigInt(deposit_utils_1.dust) });
        }
        const change = (0, wallet_utils_1.inputAmt)(tx) - deposit_utils_1.dust;
        if (change > 0)
            tx.addOutputAddress(changeAddress, BigInt(change), net);
        //tx.sign(privKey);
        //tx.finalize();
        vsize = tx.vsize;
        const fees = [
            Math.floor((vsize * feeInfo["low_fee_per_kb"]) / 1024),
            Math.floor((vsize * feeInfo["medium_fee_per_kb"]) / 1024),
            Math.floor((vsize * feeInfo["high_fee_per_kb"]) / 1024),
        ];
        return fees;
    }
    catch (err) {
        return [850, 1000, 1150];
    }
}
/**
export function getWithdrawScript (network:string, data:Uint8Array, sbtcWalletAddress:string, fromBtcAddress:string):{type:string, script:Uint8Array} {
    const net = getNet(network);
    const addrScript = btc.Address(net).decode(sbtcWalletAddress)
    if (addrScript.type === 'wpkh') {
        return {
            type: 'wsh',
            script: btc.Script.encode([data, 'DROP', btc.p2wpkh(addrScript.hash).script])
        }
    } else if (addrScript.type === 'tr') {
        return {
            type: 'tr',
            //script: btc.Script.encode([data, 'DROP', btc.OutScript.encode(btc.Address(net).decode(this.fromBtcAddress)), 'CHECKSIG'])
            //script: btc.Script.encode([data, 'DROP', 'IF', 144, 'CHECKSEQUENCEVERIFY', 'DROP', btc.OutScript.encode(btc.Address(net).decode(this.fromBtcAddress)), 'CHECKSIG', 'ELSE', 'DUP', 'HASH160', sbtcWalletUint8, 'EQUALVERIFY', 'CHECKSIG', 'ENDIF'])
            //script: btc.Script.encode([data, 'DROP', btc.p2tr(hex.decode(pubkey2)).script])
            script: btc.Script.encode([data, 'DROP', btc.p2tr(addrScript.pubkey).script])
        }
    } else {
        const asmScript = btc.Script.encode([data, 'DROP',
            'IF',
            btc.OutScript.encode(btc.Address(net).decode(sbtcWalletAddress)),
            'ELSE',
            144, 'CHECKSEQUENCEVERIFY', 'DROP',
            btc.OutScript.encode(btc.Address(net).decode(fromBtcAddress)),
            'CHECKSIG',
            'ENDIF'
        ])
        return {
            type: 'tr',
            //script: btc.Script.encode([data, 'DROP', btc.OutScript.encode(btc.Address(net).decode(this.fromBtcAddress)), 'CHECKSIG'])
            //script: btc.Script.encode([data, 'DROP', 'IF', 144, 'CHECKSEQUENCEVERIFY', 'DROP', btc.OutScript.encode(btc.Address(net).decode(this.fromBtcAddress)), 'CHECKSIG', 'ELSE', 'DUP', 'HASH160', sbtcWalletUint8, 'EQUALVERIFY', 'CHECKSIG', 'ENDIF'])
            //script: btc.Script.encode([data, 'DROP', btc.p2tr(hex.decode(pubkey2)).script])
            script: btc.p2tr(asmScript).script
        }
    }
}
*/
function getBridgeWithdrawOpDrop(network, sbtcWalletPublicKey, uiPayload, originator) {
    const data = buildData(network, uiPayload.amountSats, uiPayload.signature, true);
    const net = (0, wallet_utils_1.getNet)(network);
    let pk1U = base_1.hex.decode(sbtcWalletPublicKey);
    let pk2U = base_1.hex.decode(uiPayload.reclaimPublicKey);
    if (pk1U.length === 33)
        pk1U = pk1U.subarray(1);
    if (pk2U.length === 33)
        pk2U = pk2U.subarray(1);
    const scripts = [
        { script: btc.Script.encode([base_1.hex.decode(data), "DROP", pk1U, "CHECKSIG"]) },
        {
            script: btc.Script.encode([
                "IF",
                144,
                "CHECKSEQUENCEVERIFY",
                "DROP",
                pk2U,
                "CHECKSIG",
                "ENDIF",
            ]),
        },
    ];
    const script = btc.p2tr(btc.TAPROOT_UNSPENDABLE_KEY, scripts, net, true);
    // convert unit8 arrays to hex strings for transportation.
    const commitTxScript = (0, payload_utils_1.toStorable)(script);
    const req = {
        network,
        originator,
        commitTxScript,
        uiPayload,
        status: 1,
        mode: "op_drop",
        requestType: "withdrawal",
        created: new Date().getTime(),
        updated: new Date().getTime(),
    };
    return req;
}
function getBridgeWithdraw(network, uiPayload, originator) {
    const req = {
        network,
        originator,
        uiPayload,
        status: 1,
        mode: "op_return",
        requestType: "withdrawal",
        created: new Date().getTime(),
        updated: new Date().getTime(),
    };
    return req;
}
function buildData(network, amount, signature, opDrop) {
    if (opDrop)
        return (0, payload_utils_1.buildWithdrawPayloadOpDrop)(network, amount, signature);
    return (0, payload_utils_2.buildWithdrawPayload)(network, amount, signature);
}
