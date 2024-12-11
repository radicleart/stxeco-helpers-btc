import * as btc from "@scure/btc-signer";
import type { Transaction } from "@scure/btc-signer";
import { OpDropRequest, RevealerTransaction } from "./revealer_types";
export declare const revealPayment = 10001;
export declare const dust = 500;
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
export declare function buildOpReturnDepositTransaction(mempoolApi: string, network: string, recipient: string, amountSats: number, paymentPublicKey: string, paymentAddress: string, feeMultiplier: number, sbtcWalletPublicKey: string): Promise<{
    transaction: Transaction;
    txFee: number;
}>;
export declare function maxCommit(addressInfo: any): any;
export declare function estimateActualFee(tx: btc.Transaction, feeInfo: any): number;
export declare function buildOpDropDepositTransaction(network: string, sbtcPublicKey: string, dd: OpDropRequest): Promise<RevealerTransaction>;
