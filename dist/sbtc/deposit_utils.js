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
exports.dust = exports.revealPayment = void 0;
exports.buildOpReturnDepositTransaction = buildOpReturnDepositTransaction;
exports.maxCommit = maxCommit;
exports.estimateActualFee = estimateActualFee;
exports.buildOpDropDepositTransaction = buildOpDropDepositTransaction;
const btc = __importStar(require("@scure/btc-signer"));
const base_1 = require("@scure/base");
const payload_utils_1 = require("./payload_utils");
const wallet_utils_1 = require("./wallet_utils");
const bitcoin_api_1 = require("../bitcoin_api");
const revealer_types_1 = require("./revealer_types");
const privKey = base_1.hex.decode("0101010101010101010101010101010101010101010101010101010101010101");
exports.revealPayment = 10001;
exports.dust = 500;
/**
 * buildOpReturnDepositTransaction:Transaction
 * @param network (testnet|mainnet)
 * @param sbtcWalletPublicKey - the sbtc wallet public to sending the deposit to
 * @param uiPayload:DepositPayloadUIType
 * - recipient - stacks address or contract principal to mint to
 * - amountSats - amount in sats of sBTC to mint (and bitcoin to deposit)
 * - changeAddress - address for users change - the users cardinal/payment address
 * - paymentPublicKey - public key for users change - the users cardinal/payment public key (only needed for xverse)
 * - btcFeeRates current fee rate estimates - see endpoint /bridge-api/testnet/v1/sbtc/init-ui
 * - utxos the users utxos to spend from - from mempool/blockstream
 * @returns Transaction from @scure/btc-signer
 */
function buildOpReturnDepositTransaction(mempoolApi, network, recipient, amountSats, paymentPublicKey, paymentAddress, feeMultiplier, sbtcWalletPublicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const net = (0, wallet_utils_1.getNet)(network);
        let utxos = [];
        try {
            utxos = (yield (0, bitcoin_api_1.fetchUtxoSet)(mempoolApi, paymentAddress, true)).utxos;
        }
        catch (err) {
            console.error("=============================================================== ");
            console.error("buildOpReturnDepositTransaction: Error fetching utxos: address: " +
                paymentAddress);
            console.error("buildOpReturnDepositTransaction: Error fetching utxos: " + err.message);
            console.error("=============================================================== ");
            throw new Error("Unable to lookup UTXOs for address this could be a network failure or rate limiting by remote service: " +
                paymentAddress);
        }
        //console.log('buildOpReturnDepositTransaction: utxos:', utxos)
        const fees = yield (0, bitcoin_api_1.fetchCurrentFeeRates)(mempoolApi);
        const sbtcWalletAddress = (0, wallet_utils_1.getPegWalletAddressFromPublicKey)(network, sbtcWalletPublicKey);
        const data = (0, payload_utils_1.buildDepositPayload)(network, recipient);
        const transaction = new btc.Transaction({
            allowUnknowInput: true,
            allowUnknowOutput: true,
            allowUnknownInputs: true,
            allowUnknownOutputs: true,
        });
        const txFee = estimateActualFee(transaction, fees.feeInfo) * feeMultiplier;
        // no reveal fee for op_return
        (0, wallet_utils_1.addInputs)(network, amountSats, txFee, transaction, false, utxos, paymentPublicKey);
        transaction.addOutput({
            script: btc.Script.encode(["RETURN", base_1.hex.decode(data)]),
            amount: BigInt(0),
        });
        transaction.addOutputAddress(sbtcWalletAddress, BigInt(amountSats), net);
        const changeAmount = (0, wallet_utils_1.inputAmt)(transaction) - (amountSats + txFee);
        if (changeAmount > 0)
            transaction.addOutputAddress(paymentAddress, BigInt(changeAmount), net);
        return { transaction, txFee };
    });
}
function maxCommit(addressInfo) {
    var _a;
    if (!addressInfo || !addressInfo.utxos || addressInfo.utxos.length === 0)
        return 0;
    const summ = (_a = addressInfo === null || addressInfo === void 0 ? void 0 : addressInfo.utxos) === null || _a === void 0 ? void 0 : _a.map((item) => item.value).reduce((prev, curr) => prev + curr, 0);
    return summ || 0;
}
function estimateActualFee(tx, feeInfo) {
    try {
        const vsize = tx.vsize;
        const fees = [
            Math.floor((vsize * 10 * feeInfo["low_fee_per_kb"]) / 1024),
            Math.floor((vsize * 10 * feeInfo["medium_fee_per_kb"]) / 1024),
            Math.floor((vsize * 10 * feeInfo["high_fee_per_kb"]) / 1024),
        ];
        return fees[1];
    }
    catch (err) {
        return 10000;
    }
}
function buildOpDropDepositTransaction(network, sbtcPublicKey, dd) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //const hashBytes = getHashBytesFromAddress(dd.paymentAddress)
            //if (!hashBytes) throw new Error('Payment address is unknown: ' + dd.paymentAddress)
            if (!dd.recipient.startsWith("S"))
                throw new Error("Recipient is unknown: " + dd.recipient);
            const commitment = yield buildOpDropDepositScripts(network, dd.recipient, dd.amountSats, dd.reclaimPublicKey, sbtcPublicKey);
            // const sbtcPublicKey = await getCurrentSbtcPublicKey();
            const revealerTx = convertToRevealerTxOpDrop(dd, commitment, sbtcPublicKey);
            // await saveOrUpdate(revealerTx.txId, revealerTx);
            return revealerTx;
        }
        catch (err) {
            console.error("getPsbtForDeposit: ", err);
            throw new Error(err.message);
        }
    });
}
function convertToRevealerTxOpDrop(req, commitment, sbtcPublicKey) {
    const txId = req.recipient + ":" + req.amountSats + ":" + req.reclaimPublicKey;
    const created = new Date().getTime();
    const revealerTx = {
        txId,
        signed: false,
        originator: req.originator,
        recipient: req.recipient,
        amountSats: req.amountSats,
        commitment,
        confirmations: -1,
        sbtcPublicKey,
        paymentPublicKey: req.reclaimPublicKey,
        paymentAddress: req.paymentAddress, // this may change when the actual payment address is on-chain
        mode: revealer_types_1.RevealerTxModes.OP_DROP,
        status: revealer_types_1.CommitmentStatus.UNPAID,
        type: revealer_types_1.RevealerTxTypes.SBTC_DEPOSIT,
        created,
        updated: created,
        blockHeight: 0,
    };
    return revealerTx;
}
function buildOpDropDepositScripts(network, recipient, amountSats, reclaimPublicKey, sbtcWalletPublicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const net = (0, wallet_utils_1.getNet)(network);
        const data = buildData(network, recipient, amountSats);
        const scripts = [
            {
                script: btc.Script.encode([
                    base_1.hex.decode(data),
                    "DROP",
                    base_1.hex.decode(sbtcWalletPublicKey),
                    "CHECKSIG",
                ]),
            },
            {
                script: btc.Script.encode([
                    "IF",
                    144,
                    "CHECKSEQUENCEVERIFY",
                    "DROP",
                    base_1.hex.decode(reclaimPublicKey),
                    "CHECKSIG",
                    "ENDIF",
                ]),
            },
        ];
        const script = btc.p2tr(btc.TAPROOT_UNSPENDABLE_KEY, scripts, net, true);
        return (0, payload_utils_1.toStorable)(script);
    });
}
function buildData(network, principal, revealFee) {
    return (0, payload_utils_1.buildDepositPayloadOpDrop)(network, principal, revealFee);
}
