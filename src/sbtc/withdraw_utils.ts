import * as btc from "@scure/btc-signer";
import { hex } from "@scure/base";
import { buildWithdrawPayloadOpDrop, toStorable } from "./payload_utils";
import { buildWithdrawPayload } from "./payload_utils";
import {
  addInputs,
  getNet,
  getPegWalletAddressFromPublicKey,
  inputAmt,
} from "./wallet_utils";
import { FeeEstimateResponse } from "../bitcoin_types";
import {
  BridgeTransactionType,
  UTXO,
  WithdrawPayloadUIType,
} from "./sbtc_types";
import { dust, estimateActualFee, revealPayment } from "./deposit_utils";
import { fetchCurrentFeeRates, fetchUtxoSet } from "../bitcoin_api";

export const fullfillmentFee = 2000;

/**
 *
 * @param network
 * @param uiPayload
 * @param utxos:Array<UTXO>
 * @param btcFeeRates
 * @returns Transaction from @scure/btc-signer
 */
export async function buildWithdrawalTransaction(
  mempoolApi: string,
  network: string,
  withdrawalAddress: string,
  signature: string | undefined,
  amountSats: number,
  paymentPublicKey: string,
  paymentAddress: string,
  feeMultiplier: number,
  sbtcWalletPublicKey: string
) {
  const net = getNet(network);
  let utxos: Array<UTXO> = [];
  try {
    utxos = (await fetchUtxoSet(mempoolApi, paymentAddress, true)).utxos;
  } catch (err: any) {
    console.error(
      "=============================================================== "
    );
    console.error(
      "buildWithdrawTransaction: Error fetching utxos: address: " +
        paymentAddress
    );
    console.error(
      "buildWithdrawTransaction: Error fetching utxos: " + err.message
    );
    console.error(
      "=============================================================== "
    );
    throw new Error(
      "Unable to lookup UTXOs for address this could be a network failure or rate limiting by remote service: " +
        paymentAddress
    );
  }
  const sbtcWalletAddress = getPegWalletAddressFromPublicKey(
    network,
    sbtcWalletPublicKey
  );
  console.log("Withdrawal: from sbtc wallet: " + sbtcWalletAddress);
  if (!signature) throw new Error("No signature");
  const data = buildData(network, amountSats, signature, false);
  const tx = new btc.Transaction({
    allowUnknowOutput: true,
    allowUnknownInputs: true,
    allowUnknownOutputs: true,
  });
  const fees = await fetchCurrentFeeRates(mempoolApi);
  const txFee = estimateActualFee(tx, fees.feeInfo) * feeMultiplier;
  addInputs(network, amountSats, 0, tx, false, utxos, paymentPublicKey);
  tx.addOutput({
    script: btc.Script.encode(["RETURN", hex.decode(data)]),
    amount: BigInt(0),
  });
  const change = inputAmt(tx) - (fullfillmentFee + dust + txFee);
  tx.addOutputAddress(withdrawalAddress, BigInt(dust), net);
  tx.addOutputAddress(sbtcWalletAddress!, BigInt(fullfillmentFee), net);
  if (change > 0) tx.addOutputAddress(paymentAddress, BigInt(change), net);
  return { transaction: tx, txFee };
}

/**
 *
 * @param network
 * @param uiPayload
 * @param utxos:Array<UTXO>
 * @param btcFeeRates
 * @param originator
 * @returns
 */
export function buildWithdrawTransactionOpDrop(
  network: string,
  sbtcWalletPublicKey: string,
  uiPayload: WithdrawPayloadUIType,
  utxos: Array<UTXO>,
  btcFeeRates: any,
  originator: string
) {
  if (!uiPayload.signature)
    throw new Error("Signature of output 2 scriptPubKey is required");
  const net = getNet(network);
  const sbtcWalletAddress = getPegWalletAddressFromPublicKey(
    network,
    sbtcWalletPublicKey
  );
  const txFees = calculateWithdrawFees(
    network,
    true,
    utxos,
    uiPayload.amountSats,
    btcFeeRates,
    sbtcWalletAddress!,
    uiPayload.bitcoinAddress,
    uiPayload.paymentPublicKey,
    undefined
  );
  const tx = new btc.Transaction({
    allowUnknowOutput: true,
    allowUnknownInputs: true,
    allowUnknownOutputs: true,
  });
  addInputs(
    network,
    uiPayload.amountSats,
    revealPayment,
    tx,
    false,
    utxos,
    uiPayload.paymentPublicKey
  );
  const csvScript = getBridgeWithdrawOpDrop(
    network,
    sbtcWalletPublicKey,
    uiPayload,
    originator
  );
  //(network, data, sbtcWalletAddress, uiPayload.bitcoinAddress);
  if (!csvScript) throw new Error("script required!");

  tx.addOutput({ script: csvScript.commitTxScript!.script, amount: BigInt(0) });
  tx.addOutputAddress(uiPayload.bitcoinAddress, BigInt(dust), net);
  tx.addOutputAddress(sbtcWalletAddress!, BigInt(fullfillmentFee), net);
  const change = inputAmt(tx) - (fullfillmentFee + dust + txFees[1]);
  if (change > 0)
    tx.addOutputAddress(uiPayload.bitcoinAddress, BigInt(change), net);
  return tx;
}

function calculateWithdrawFees(
  network: string,
  opDrop: boolean,
  utxos: Array<UTXO>,
  amount: number,
  feeInfo: {
    low_fee_per_kb: number;
    medium_fee_per_kb: number;
    high_fee_per_kb: number;
  },
  sbtcWalletAddress: string,
  changeAddress: string,
  paymentPublicKey: string,
  data: Uint8Array | undefined
) {
  try {
    let vsize = 0;
    const net = getNet(network);
    const tx = new btc.Transaction({
      allowUnknowOutput: true,
      allowUnknownInputs: true,
      allowUnknownOutputs: true,
    });
    addInputs(
      network,
      amount,
      revealPayment,
      tx,
      true,
      utxos,
      paymentPublicKey
    );
    if (!opDrop) {
      if (data)
        tx.addOutput({
          script: btc.Script.encode(["RETURN", data]),
          amount: BigInt(0),
        });
      tx.addOutputAddress(sbtcWalletAddress, BigInt(dust), net);
    } else {
      tx.addOutput({ script: sbtcWalletAddress, amount: BigInt(dust) });
    }
    const change = inputAmt(tx) - dust;
    if (change > 0) tx.addOutputAddress(changeAddress, BigInt(change), net);
    //tx.sign(privKey);
    //tx.finalize();
    vsize = tx.vsize;
    const fees = [
      Math.floor((vsize * feeInfo["low_fee_per_kb"]) / 1024),
      Math.floor((vsize * feeInfo["medium_fee_per_kb"]) / 1024),
      Math.floor((vsize * feeInfo["high_fee_per_kb"]) / 1024),
    ];
    return fees;
  } catch (err: any) {
    return [850, 1000, 1150];
  }
}

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

export function getBridgeWithdrawOpDrop(
  network: string,
  sbtcWalletPublicKey: string,
  uiPayload: WithdrawPayloadUIType,
  originator: string
): BridgeTransactionType {
  const data = buildData(
    network,
    uiPayload.amountSats,
    uiPayload.signature!,
    true
  );
  const net = getNet(network);

  let pk1U = hex.decode(sbtcWalletPublicKey);
  let pk2U = hex.decode(uiPayload.reclaimPublicKey);
  if (pk1U.length === 33) pk1U = pk1U.subarray(1);
  if (pk2U.length === 33) pk2U = pk2U.subarray(1);

  const scripts = [
    { script: btc.Script.encode([hex.decode(data), "DROP", pk1U, "CHECKSIG"]) },
    {
      script: btc.Script.encode([
        "IF",
        144,
        "CHECKSEQUENCEVERIFY",
        "DROP",
        pk2U,
        "CHECKSIG",
        "ENDIF",
      ]),
    },
  ];
  const script = btc.p2tr(btc.TAPROOT_UNSPENDABLE_KEY, scripts, net, true);
  // convert unit8 arrays to hex strings for transportation.
  const commitTxScript = toStorable(script);
  const req: BridgeTransactionType = {
    network,
    originator,
    commitTxScript,
    uiPayload,
    status: 1,
    mode: "op_drop",
    requestType: "withdrawal",
    created: new Date().getTime(),
    updated: new Date().getTime(),
  };
  return req;
}

export function getBridgeWithdraw(
  network: string,
  uiPayload: WithdrawPayloadUIType,
  originator: string
): BridgeTransactionType {
  const req: BridgeTransactionType = {
    network,
    originator,
    uiPayload,
    status: 1,
    mode: "op_return",
    requestType: "withdrawal",
    created: new Date().getTime(),
    updated: new Date().getTime(),
  };
  return req;
}

function buildData(
  network: string,
  amount: number,
  signature: string,
  opDrop: boolean
): string {
  if (opDrop) return buildWithdrawPayloadOpDrop(network, amount, signature);
  return buildWithdrawPayload(network, amount, signature);
}
