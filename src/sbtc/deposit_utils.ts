import * as btc from "@scure/btc-signer";
import * as P from "micro-packed";
import { hex } from "@scure/base";
import type { Transaction } from "@scure/btc-signer";
import {
  buildDepositPayload,
  buildDepositPayloadOpDrop,
  toStorable,
} from "./payload_utils";
import {
  addInputs,
  getNet,
  getPegWalletAddressFromPublicKey,
  inputAmt,
} from "./wallet_utils";
import { FeeEstimateResponse } from "../bitcoin_types";
import { CommitmentScriptDataType, UTXO } from "./sbtc_types";
import { fetchCurrentFeeRates, fetchUtxoSet } from "../bitcoin_api";
import {
  CommitmentStatus,
  OpDropRequest,
  RevealerTransaction,
  RevealerTxModes,
  RevealerTxTypes,
} from "./revealer_types";

const privKey = hex.decode(
  "0101010101010101010101010101010101010101010101010101010101010101"
);
export const revealPayment = 10001;
export const dust = 500;

/**
 * buildOpReturnDepositTransaction:Transaction
 * @param network (testnet|mainnet)
 * @param sbtcWalletPublicKey - the sbtc wallet public to sending the deposit to
 * @param uiPayload:DepositPayloadUIType
 * - recipient - stacks address or contract principal to mint to
 * - amountSats - amount in sats of sBTC to mint (and bitcoin to deposit)
 * - changeAddress - address for users change - the users cardinal/payment address
 * - paymentPublicKey - public key for users change - the users cardinal/payment public key (only needed for xverse)
 * - btcFeeRates current fee rate estimates - see endpoint /bridge-api/testnet/v1/sbtc/init-ui
 * - utxos the users utxos to spend from - from mempool/blockstream
 * @returns Transaction from @scure/btc-signer
 */
export async function buildOpReturnDepositTransaction(
  mempoolApi: string,
  network: string,
  recipient: string,
  amountSats: number,
  paymentPublicKey: string,
  paymentAddress: string,
  feeMultiplier: number,
  sbtcWalletPublicKey: string
): Promise<{ transaction: Transaction; txFee: number }> {
  const net = getNet(network);
  let utxos: Array<UTXO> = [];
  try {
    utxos = (await fetchUtxoSet(mempoolApi, paymentAddress, true)).utxos;
  } catch (err: any) {
    console.error(
      "=============================================================== "
    );
    console.error(
      "buildOpReturnDepositTransaction: Error fetching utxos: address: " +
        paymentAddress
    );
    console.error(
      "buildOpReturnDepositTransaction: Error fetching utxos: " + err.message
    );
    console.error(
      "=============================================================== "
    );
    throw new Error(
      "Unable to lookup UTXOs for address this could be a network failure or rate limiting by remote service: " +
        paymentAddress
    );
  }
  //console.log('buildOpReturnDepositTransaction: utxos:', utxos)
  const fees = await fetchCurrentFeeRates(mempoolApi);
  const sbtcWalletAddress = getPegWalletAddressFromPublicKey(
    network,
    sbtcWalletPublicKey
  );
  const data = buildDepositPayload(network, recipient);

  const transaction = new btc.Transaction({
    allowUnknowInput: true,
    allowUnknowOutput: true,
    allowUnknownInputs: true,
    allowUnknownOutputs: true,
  });
  const txFee = estimateActualFee(transaction, fees.feeInfo) * feeMultiplier;
  // no reveal fee for op_return
  addInputs(
    network,
    amountSats,
    txFee,
    transaction,
    false,
    utxos,
    paymentPublicKey
  );
  transaction.addOutput({
    script: btc.Script.encode(["RETURN", hex.decode(data)]),
    amount: BigInt(0),
  });
  transaction.addOutputAddress(sbtcWalletAddress!, BigInt(amountSats), net);
  const changeAmount = inputAmt(transaction) - (amountSats + txFee);
  if (changeAmount > 0)
    transaction.addOutputAddress(paymentAddress, BigInt(changeAmount), net);
  return { transaction, txFee };
}

export function maxCommit(addressInfo: any) {
  if (!addressInfo || !addressInfo.utxos || addressInfo.utxos.length === 0)
    return 0;
  const summ = addressInfo?.utxos
    ?.map((item: { value: number }) => item.value)
    .reduce((prev: number, curr: number) => prev + curr, 0);
  return summ || 0;
}

export function estimateActualFee(tx: btc.Transaction, feeInfo: any): number {
  try {
    const vsize = tx.vsize;
    const fees = [
      Math.floor((vsize * 10 * feeInfo["low_fee_per_kb"]) / 1024),
      Math.floor((vsize * 10 * feeInfo["medium_fee_per_kb"]) / 1024),
      Math.floor((vsize * 10 * feeInfo["high_fee_per_kb"]) / 1024),
    ];
    return fees[1];
  } catch (err: any) {
    return 10000;
  }
}

export async function buildOpDropDepositTransaction(
  network: string,
  sbtcPublicKey: string,
  dd: OpDropRequest
): Promise<RevealerTransaction> {
  try {
    //const hashBytes = getHashBytesFromAddress(dd.paymentAddress)
    //if (!hashBytes) throw new Error('Payment address is unknown: ' + dd.paymentAddress)
    if (!dd.recipient.startsWith("S"))
      throw new Error("Recipient is unknown: " + dd.recipient);
    const commitment: CommitmentScriptDataType =
      await buildOpDropDepositScripts(
        network,
        dd.recipient,
        dd.amountSats,
        dd.reclaimPublicKey,
        sbtcPublicKey
      );
    // const sbtcPublicKey = await getCurrentSbtcPublicKey();
    const revealerTx: RevealerTransaction = convertToRevealerTxOpDrop(
      dd,
      commitment,
      sbtcPublicKey
    );
    // await saveOrUpdate(revealerTx.txId, revealerTx);
    return revealerTx;
  } catch (err: any) {
    console.error("getPsbtForDeposit: ", err);
    throw new Error(err.message);
  }
}

function convertToRevealerTxOpDrop(
  req: OpDropRequest,
  commitment: CommitmentScriptDataType,
  sbtcPublicKey: string
) {
  const txId =
    req.recipient + ":" + req.amountSats + ":" + req.reclaimPublicKey;
  const created = new Date().getTime();
  const revealerTx: RevealerTransaction = {
    txId,
    signed: false,
    originator: req.originator,
    recipient: req.recipient,
    amountSats: req.amountSats,
    commitment,
    confirmations: -1,
    sbtcPublicKey,
    paymentPublicKey: req.reclaimPublicKey,
    paymentAddress: req.paymentAddress, // this may change when the actual payment address is on-chain
    mode: RevealerTxModes.OP_DROP,
    status: CommitmentStatus.UNPAID,
    type: RevealerTxTypes.SBTC_DEPOSIT,
    created,
    updated: created,
    blockHeight: 0,
  };
  return revealerTx;
}

async function buildOpDropDepositScripts(
  network: string,
  recipient: string,
  amountSats: number,
  reclaimPublicKey: string,
  sbtcWalletPublicKey: string
): Promise<CommitmentScriptDataType> {
  const net = getNet(network);

  const data = buildData(network, recipient, amountSats);
  const scripts = [
    {
      script: btc.Script.encode([
        hex.decode(data),
        "DROP",
        hex.decode(sbtcWalletPublicKey),
        "CHECKSIG",
      ]),
    },
    {
      script: btc.Script.encode([
        "IF",
        144,
        "CHECKSEQUENCEVERIFY",
        "DROP",
        hex.decode(reclaimPublicKey),
        "CHECKSIG",
        "ENDIF",
      ]),
    },
  ];
  const script = btc.p2tr(btc.TAPROOT_UNSPENDABLE_KEY, scripts, net, true);
  return toStorable(script);
}

function buildData(
  network: string,
  principal: string,
  revealFee: number
): string {
  return buildDepositPayloadOpDrop(network, principal, revealFee);
}
