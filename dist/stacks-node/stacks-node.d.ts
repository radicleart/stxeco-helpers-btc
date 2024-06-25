import { StacksMainnet, StacksTestnet } from "@stacks/network";
import { TokenBalances } from "../sbtc";
export declare function fetchDataVar(stacksApi: string, contractAddress: string, contractName: string, dataVarName: string): Promise<any>;
export declare function getStacksNetwork(network: string): StacksMainnet | StacksTestnet;
export declare function lookupContract(stacksApi: string, contract_id: string): Promise<any>;
export declare function isConstructed(stacksApi: string, contract_id: string): Promise<any>;
export declare function fetchStacksInfo(stacksApi: string): Promise<any>;
export declare function getTokenBalances(stacksApi: string, principal: string): Promise<TokenBalances>;
export declare function getPoxInfo(stacksApi: string): Promise<any>;
export declare function callContractReadOnly(stacksApi: string, data: any): Promise<any>;