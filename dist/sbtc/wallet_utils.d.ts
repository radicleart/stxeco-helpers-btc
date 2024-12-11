import * as btc from "@scure/btc-signer";
import { CommitKeysI, UTXO } from "./sbtc_types";
export declare const REGTEST_NETWORK: typeof btc.NETWORK;
export declare function getNet(network: string): {
    bech32: string;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
};
export declare const sbtcWallets: {
    sbtcAddress: string;
    pubKey: string;
    desc: string;
    parent_desc: string;
    scriptPubKey: string;
    witness_program: string;
}[];
/**
 * Constructs the script hash with script paths corresponding to two internal
 * test wallets.
 */
export declare function getTestAddresses(network: string): CommitKeysI;
export declare function addressFromPubkey(network: string, pubkey: Uint8Array): string;
export declare function checkAddressForNetwork(net: string, address: string | undefined): void;
/**
 *
 * @param amount - if deposit this is the amount the user is sending. Note: 0 for withdrawals
 * @param revealPayment - if op drop this is the gas fee for the reveal tx
 * @param tx - the to add input to
 * @param feeCalc - true if called for the purposes of calculating the fee (i.e. okay to sign inputs with internal key)
 * @param utxos - the utxos being spent from
 * @param paymentPublicKey - pubkey used in script hash payments
export function addInputs (network:string, amount:number, revealPayment:number, tx:btc.Transaction, feeCalc:boolean, utxos:Array<UTXO>, paymentPublicKey:string, userSchnorrPubKey:string) {
    const bar = revealPayment + amount;
    let amt = 0;
    for (const utxo of utxos) {
        const hexy = (utxo.tx.hex) ? utxo.tx.hex : utxo.tx
        const script = btc.RawTx.decode(hex.decode(hexy))
        if (amt < bar && utxo.status.confirmed) {
            amt += utxo.value;
            //const pubkey = '0248159447374471c5a6cfa18c296e6e297dbf125a9e6792435a87e80c4f771493'
            //const script1 = (btc.p2ms(1, [hex.decode(pubkey)]))
            const txType = utxo.tx.vout[utxo.vout].scriptPubKey.type;
            if (txType === 'scripthash') {
                // educated guess at the p2sh wrapping based on the type of the other (non change) output...
                let wrappedType = ''
                if (utxo.vout === 1) {
                    wrappedType = utxo.tx.vout[0].scriptPubKey.type
                } else {
                    wrappedType = utxo.tx.vout[1].scriptPubKey.type
                }
                const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
                let p2shObj;
                if (wrappedType === 'witness_v0_keyhash') {
                    p2shObj = btc.p2sh(btc.p2wpkh(hex.decode(paymentPublicKey)), net)
                } else if (wrappedType === 'witness_v1_taproot') {
                    p2shObj = btc.p2sh(btc.p2tr(hex.decode(userSchnorrPubKey)), net)
                } else if (wrappedType.indexOf('multi') > -1) {
                    p2shObj = btc.p2sh(btc.p2ms(1, [hex.decode(paymentPublicKey)]), net)
                } else {
                    p2shObj = btc.p2sh(btc.p2pkh(hex.decode(paymentPublicKey)), net)
                }
                const nextI:btc.TransactionInput = {
                    txid: hex.decode(utxo.txid),
                    index: utxo.vout,
                    nonWitnessUtxo: hexy,
                    redeemScript: p2shObj.redeemScript
                }
                tx.addInput(nextI);
            } else {
                let witnessUtxo = {
                    script: script.outputs[utxo.vout].script,
                    amount: BigInt(utxo.value)
                }
                if (feeCalc) {
                    witnessUtxo = {
                        amount: BigInt(utxo.value),
                        script: btc.p2wpkh(secp.getPublicKey(privKey, true)).script,
                    }
                }
                const nextI:btc.TransactionInput = {
                    txid: hex.decode(utxo.txid),
                    index: utxo.vout,
                    nonWitnessUtxo: hexy,
                    witnessUtxo
                }
                tx.addInput(nextI);
            }
        }
    }
}
 */
export declare function addInputs(network: string, amount: number, txFee: number, transaction: btc.Transaction, feeCalc: boolean, utxos: Array<UTXO>, paymentPublicKey: string): void;
/**
 * getAddressFromOutScript converts a script to an address
 * @param network:string
 * @param script: Uint8Array
 * @returns address as string
 */
export declare function getAddressFromOutScript(network: string, script: Uint8Array): string;
export declare function inputAmt(tx: btc.Transaction): number;
/**
 *
 * @param pubkey
 * @returns
 */
export declare function toXOnly(pubkey: string): string;
/**
 *
 * @param network
 * @param sbtcWalletPublicKey
 * @returns
 */
export declare function getPegWalletAddressFromPublicKey(network: string, sbtcWalletPublicKey: string): string;
