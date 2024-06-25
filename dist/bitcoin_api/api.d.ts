import { AddressMempoolObject } from "../bitcoin_types";
export declare function fetchCurrentFeeRates(mempoolUrl: string, blockCypherUrl: string, network: string): Promise<{
    feeInfo: {
        low_fee_per_kb: any;
        medium_fee_per_kb: any;
        high_fee_per_kb: any;
    };
}>;
export declare function sendRawTxDirectBlockCypher(blockCypherUrl: string, hex: string): Promise<any>;
export declare function fetchBitcoinTipHeight(mempoolUrl: string): Promise<string | undefined>;
export declare function fetchTransactionHex(mempoolUrl: string, txid: string): Promise<string | undefined>;
export declare function fetchTransaction(mempoolUrl: string, txid: string): Promise<any>;
export declare function fetchAddress(mempoolUrl: string, address: string): Promise<AddressMempoolObject>;
export declare function fetchAddressTransactions(mempoolUrl: string, address: string, txId?: string): Promise<any[]>;
export declare function fetchAddressTransactionsMin(mempoolUrl: string, address: string): Promise<any>;
export declare function fetchUtxosForAddress(electrumUrl: string, address: string): Promise<any>;
export declare function fetchUTXOs(mempoolUrl: string, address: string): Promise<any>;
export declare function readTx(mempoolUrl: string, txid: string): Promise<any>;
export declare function sendRawTxDirectMempool(mempoolUrl: string, hex: string): Promise<any>;
