/**
 * @deprecated - maybe not needed with op_drop as the users wallet calculates
 * the fees. Keep for now in case we switch back to op_return
 * @returns
 */
export declare function approxTxFees(network: string, utxos: any, changeAddress: string, payeeAddress: string): number;
