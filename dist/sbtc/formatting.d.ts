export declare function satsToBitcoin(amountSats: number): number;
export declare function bitcoinToSats(amountBtc: number): number;
export declare function fmtSatoshiToBitcoin(amountSats: number): string;
export declare function fmtMicroToStx(amountStx: number): string;
export declare function tsToDate(updated: number | undefined): string;
export declare function fmtAmount(amount: number, currency: string): string;
export declare function convertDatToBH(date: number, currentBH: number): number;
export declare function fmtNumber(amount: number | undefined): string | 0 | undefined;
export declare function truncate(stringy?: string, amount?: number): string;
export declare function truncateId(stringy?: string, amount?: number): string;
