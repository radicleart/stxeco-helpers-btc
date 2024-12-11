import * as btc from "@scure/btc-signer";
import { BridgeTransactionType, UTXO, WithdrawPayloadUIType } from "./sbtc_types";
export declare const fullfillmentFee = 2000;
/**
 *
 * @param network
 * @param uiPayload
 * @param utxos:Array<UTXO>
 * @param btcFeeRates
 * @returns Transaction from @scure/btc-signer
 */
export declare function buildWithdrawalTransaction(mempoolApi: string, network: string, withdrawalAddress: string, signature: string | undefined, amountSats: number, paymentPublicKey: string, paymentAddress: string, feeMultiplier: number, sbtcWalletPublicKey: string): Promise<{
    transaction: btc.Transaction;
    txFee: number;
}>;
/**
 *
 * @param network
 * @param uiPayload
 * @param utxos:Array<UTXO>
 * @param btcFeeRates
 * @param originator
 * @returns
 */
export declare function buildWithdrawTransactionOpDrop(network: string, sbtcWalletPublicKey: string, uiPayload: WithdrawPayloadUIType, utxos: Array<UTXO>, btcFeeRates: any, originator: string): btc.Transaction;
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
export declare function getBridgeWithdrawOpDrop(network: string, sbtcWalletPublicKey: string, uiPayload: WithdrawPayloadUIType, originator: string): BridgeTransactionType;
export declare function getBridgeWithdraw(network: string, uiPayload: WithdrawPayloadUIType, originator: string): BridgeTransactionType;
