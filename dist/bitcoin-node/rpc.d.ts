import { FeeEstimateResponse } from "../bitcoin_types";
export declare function handleError(response: any, message: string): Promise<void>;
export declare function startScantxoutset(rpcUrl: string, address: string): Promise<any>;
export declare function getBlockChainInfo(rpcUrl: string): Promise<any>;
export declare function getBlockHeader(rpcUrl: string, hash: string, verbosity: boolean): Promise<any>;
export declare function getBlock(rpcUrl: string, hash: string, verbosity: number): Promise<any>;
export declare function getTxOutProof(rpcUrl: string, txs: Array<string>, blockhash: string): Promise<any>;
export declare function getBlockCount(rpcUrl: string): Promise<{
    count: any;
}>;
export declare function sendRawTxRpc(rpcUrl: string, hex: string, maxFeeRate: number): Promise<any>;
export declare function fetchRawTxRpc(rpcUrl: string, txid: string, verbose: boolean): Promise<any>;
export declare function createWallet(rpcUrl: string, wallet: string): Promise<any>;
export declare function listUnspent(rpcUrl: string): Promise<any>;
export declare function validateAddress(rpcUrl: string, address: string): Promise<any>;
export declare function estimateSmartFee(rpcUrl: string): Promise<FeeEstimateResponse>;
export declare function listReceivedByAddress(rpcUrl: string): Promise<any>;
export declare function listWallets(rpcUrl: string): Promise<any>;
export declare function unloadWallet(rpcUrl: string, name: string): Promise<any>;
export declare function loadWallet(rpcUrl: string, name: string): Promise<any>;
export declare function generateNewAddress(rpcUrl: string, addressType: string): Promise<any>;
export declare function walletProcessPsbt(rpcUrl: string, psbtHex: string): Promise<any>;
export declare function getAddressInfo(rpcUrl: string, address: string): Promise<any>;
export declare function importAddress(rpcUrl: string, address: string): Promise<any>;
export declare function importPubkey(rpcUrl: string, pubkey: string): Promise<any>;
export declare function getWalletInfo(rpcUrl: string, pubkey: string): Promise<any>;
