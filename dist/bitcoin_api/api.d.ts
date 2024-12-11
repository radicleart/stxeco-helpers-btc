import { AddressMempoolObject } from "../bitcoin_types";
export declare function fetchCurrentFeeRates(mempoolUrl: string): Promise<{
    feeInfo: {
        low_fee_per_kb: number;
        medium_fee_per_kb: number;
        high_fee_per_kb: number;
    };
}>;
export declare function sendRawTxDirectBlockCypher(blockCypherUrl: string, hex: string): Promise<any>;
export declare function fetchBitcoinTipHeight(mempoolUrl: string): Promise<string | undefined>;
export declare function fetchBlockByHash(mempoolUrl: string, hash: string): Promise<any>;
export declare function fetchBlockByHashWithTransactionIds(mempoolUrl: string, hash: string): Promise<any>;
export declare function fetchBlockByHashWithTransactions(mempoolUrl: string, hash: string, start_index: number): Promise<any>;
export declare function fetchBlockAtHeight(mempoolUrl: string, height: number): Promise<any>;
export declare function fetchTransactionHex(mempoolUrl: string, txid: string): Promise<string | undefined>;
export declare function fetchTransaction(mempoolUrl: string, txid: string): Promise<any>;
export declare function fetchAddress(mempoolUrl: string, address: string): Promise<AddressMempoolObject>;
export declare function fetchAddressTransactions(mempoolUrl: string, address: string, txId?: string): Promise<any[]>;
export declare function fetchAddressTransactionsMin(mempoolUrl: string, address: string): Promise<any>;
export declare function fetchUtxosForAddress(electrumUrl: string, address: string): Promise<any>;
export declare function fetchUTXOs(mempoolUrl: string, address: string): Promise<any>;
export declare function fetchUtxoSet(mempoolUrl: string, address: string, verbose: boolean): Promise<any>;
export declare function readTx(mempoolUrl: string, txid: string): Promise<any>;
export declare function sendRawTxDirectMempool(mempoolUrl: string, hex: string): Promise<any>;
