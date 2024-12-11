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
exports.approxTxFees = approxTxFees;
const secp = __importStar(require("@noble/secp256k1"));
const btc = __importStar(require("@scure/btc-signer"));
const base_1 = require("@scure/base");
const payload_utils_1 = require("./payload_utils");
const wallet_utils_1 = require("./wallet_utils");
const privKey = base_1.hex.decode("0101010101010101010101010101010101010101010101010101010101010101");
const priv = secp.utils.randomPrivateKey();
const keySetForFeeCalculation = [];
keySetForFeeCalculation.push({
    priv,
    ecdsaPub: secp.getPublicKey(priv, true),
    schnorrPub: secp.getPublicKey(priv, false),
});
/**
 * @deprecated - maybe not needed with op_drop as the users wallet calculates
 * the fees. Keep for now in case we switch back to op_return
 * @returns
 */
function approxTxFees(network, utxos, changeAddress, payeeAddress) {
    console.log("approxTxFees change=" + changeAddress);
    console.log("approxTxFees dest=" + payeeAddress);
    const net = (0, wallet_utils_1.getNet)(network);
    const tx = new btc.Transaction({
        allowUnknowOutput: true,
        allowUnknownInputs: true,
        allowUnknownOutputs: true,
    });
    // create a set of inputs corresponding to the utxo set
    if (!utxos || utxos.length === 0)
        throw new Error("No UTXOs");
    for (const utxo of utxos) {
        tx.addInput({
            txid: base_1.hex.decode(utxo.txid),
            index: utxo.vout,
            witnessUtxo: {
                amount: BigInt(600),
                script: btc.p2wpkh(secp.getPublicKey(privKey, true)).script,
            },
        });
    }
    if (tx.inputsLength === 0)
        throw new Error("No confirmed UTXOs");
    const data = (0, payload_utils_1.buildDepositPayloadOpDrop)(network, "ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT", 1000);
    tx.addOutput({
        script: btc.Script.encode(["RETURN", base_1.hex.decode(data)]),
        amount: BigInt(0),
    });
    //tx.addOutput({ script: btc.OutScript.encode(btc.Address(net).decode(payeeAddress)), amount });
    tx.addOutputAddress(payeeAddress, BigInt(500), net);
    const changeAmount = Math.floor(0);
    if (changeAmount > 0)
        tx.addOutputAddress(changeAddress, BigInt(changeAmount), net);
    tx.sign(privKey);
    tx.finalize();
    return Number(tx.fee);
}
