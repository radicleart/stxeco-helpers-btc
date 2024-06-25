export declare function getAddressFromHashBytes(netowrk: string, hashBytes: string, version: string): string | undefined;
export declare function getHashBytesFromAddress(netowrk: string, address: string): {
    version: string;
    hashBytes: string;
} | undefined;
