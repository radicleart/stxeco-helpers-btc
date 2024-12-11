import { AddressMempoolObject } from "../bitcoin_types";

export async function fetchCurrentFeeRates(mempoolUrl: string) {
  const url = mempoolUrl + "/v1/fees/recommended";
  const response = await fetch(url);
  const info = await response.json();
  return {
    feeInfo: {
      low_fee_per_kb: info.economyFee * 1000,
      medium_fee_per_kb: info.hourFee * 1000,
      high_fee_per_kb: info.fastestFee * 1000,
    },
  };
}

export async function sendRawTxDirectBlockCypher(
  blockCypherUrl: string,
  hex: string
) {
  const url = blockCypherUrl + "/txs/push";
  //console.log('sendRawTxDirectBlockCypher: ', url)
  const response = await fetch(url, {
    method: "POST",
    //headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tx: hex }),
  });
  //if (response.status !== 200) console.log('Mempool error: ' + response.status + ' : ' + response.statusText);
  try {
    return await response.json();
  } catch (err) {
    try {
      console.log(err);
      return await response.text();
    } catch (err1) {
      console.log(err1);
    }
  }
  return "success";
}

export async function fetchBitcoinTipHeight(mempoolUrl: string) {
  try {
    const url = mempoolUrl + "/blocks/tip/height";
    const response = await fetch(url);
    const hex = await response.text();
    return hex;
  } catch (err) {
    console.log(err);
    return;
  }
}

export async function fetchBlockByHash(mempoolUrl: string, hash: string) {
  try {
    let url = `${mempoolUrl}/block/${hash}`;
    let response = await fetch(url);
    const block = await response.json();
    return block;
  } catch (error) {
    console.error("Error fetching block timestamp:", error);
  }
}

export async function fetchBlockByHashWithTransactionIds(
  mempoolUrl: string,
  hash: string
) {
  try {
    let url = `${mempoolUrl}/block/${hash}/txids`;
    let response = await fetch(url);
    const block = await response.json();
    return block;
  } catch (error) {
    console.error("Error fetching block timestamp:", error);
  }
}

export async function fetchBlockByHashWithTransactions(
  mempoolUrl: string,
  hash: string,
  start_index: number
) {
  try {
    let url = `${mempoolUrl}/block/${hash}/txs/${start_index}`;
    let response = await fetch(url);
    const block = await response.json();
    return block;
  } catch (error) {
    console.error("Error fetching block timestamp:", error);
  }
}

export async function fetchBlockAtHeight(mempoolUrl: string, height: number) {
  try {
    let url = `${mempoolUrl}/block-height/${height}`;
    let response = await fetch(url);
    const blockHash = await response.text();
    url = `${mempoolUrl}/block/${blockHash}`;
    response = await fetch(url);
    const block = await response.json();
    return block;
  } catch (error) {
    console.error("Error fetching block timestamp:", error);
  }
}

export async function fetchTransactionHex(mempoolUrl: string, txid: string) {
  try {
    //https://api.blockcypher.com/v1/btc/test3/txs/<txID here>?includeHex=true
    //https://mempool.space/api/tx/15e10745f15593a899cef391191bdd3d7c12412cc4696b7bcb669d0feadc8521/hex
    const url = mempoolUrl + "/tx/" + txid + "/hex";
    const response = await fetch(url);
    const hex = await response.text();
    return hex;
  } catch (err) {
    console.log(err);
    return;
  }
}

export async function fetchTransaction(mempoolUrl: string, txid: string) {
  try {
    const url = mempoolUrl + "/tx/" + txid;
    const response = await fetch(url);
    if (response.status !== 200)
      throw new Error(
        "fetchTransaction: Unable to fetch transaction for: " + txid
      );
    const tx = await response.json();
    return tx;
  } catch (err) {
    console.log(err);
    return;
  }
}

export async function fetchAddress(
  mempoolUrl: string,
  address: string
): Promise<AddressMempoolObject> {
  const url = mempoolUrl + "/address/" + address;
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

export async function fetchAddressTransactions(
  mempoolUrl: string,
  address: string,
  txId?: string
) {
  const urlBase = mempoolUrl + "/address/" + address + "/txs";
  let url = urlBase;
  if (txId) {
    url = urlBase + "/chain/" + txId;
  }
  console.log("fetchAddressTransactions: url: " + url);
  let response: any;
  let allResults: Array<any> = [];
  let results: Array<any>;
  let fetchMore = true;
  do {
    try {
      response = await fetch(url);
      results = await response.json();
      if (results && results.length > 0) {
        console.log(
          "fetchAddressTransactions: " +
            results.length +
            " found at " +
            results[results.length - 1].status.block_height
        );
        url = urlBase + "/chain/" + results[results.length - 1].txid;
        allResults = allResults.concat(results);
      } else {
        fetchMore = false;
      }
    } catch (err: any) {
      console.error("fetchAddressTransactions" + err.message);
      fetchMore = false;
    }
  } while (fetchMore);
  console.log(
    "fetchAddressTransactions: total of " +
      allResults.length +
      " found at " +
      address
  );
  return allResults;
}

export async function fetchAddressTransactionsMin(
  mempoolUrl: string,
  address: string
) {
  const url = mempoolUrl + "/address/" + address + "/txs";
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

export async function fetchUtxosForAddress(
  electrumUrl: string,
  address: string
) {
  let url = electrumUrl + "/address/" + address + "/utxo";
  console.log("fetchUtxoSetDevnet: fetchUtxosForAddress" + url);
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

export async function fetchUTXOs(mempoolUrl: string, address: string) {
  try {
    // this will work on test/main net but not devnet
    const url = mempoolUrl + "/address/" + address + "/utxo";
    const response = await fetch(url);
    //if (response.status !== 200) throw new Error('Unable to retrieve utxo set from mempool?');
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return;
  }
}

export async function fetchUtxoSet(
  mempoolUrl: string,
  address: string,
  verbose: boolean
): Promise<any> {
  let result: any = {};
  try {
    const utxos = await fetchUTXOs(mempoolUrl, address);
    for (let utxo of utxos) {
      const res = await fetchTransaction(mempoolUrl, utxo.txid);
      if (verbose) res.hex = await fetchTransactionHex(mempoolUrl, utxo.txid);
      utxo.tx = res;
    }
    result.utxos = utxos;
  } catch (err: any) {
    console.error("fetchUtxoSet: fetchUTXOs: " + address + " : " + err.message);
    // carry on
  }
  return result;
}

export async function readTx(mempoolUrl: string, txid: string) {
  const url = mempoolUrl + "/tx/" + txid;
  const response = await fetch(url);
  const result = await response.json();
  let error = "";
  try {
    return result.vout;
  } catch (err: any) {
    error = err.message;
  }
  throw new Error(error);
}

export async function sendRawTxDirectMempool(mempoolUrl: string, hex: string) {
  const url = mempoolUrl + "/tx";
  console.log("sendRawTxDirectMempool: ", url);
  const response = await fetch(url, {
    method: "POST",
    //headers: { 'Content-Type': 'application/json' },
    body: hex,
  });
  let result: any;
  if (response.status !== 200)
    throw new Error(
      "Mempool error: " + response.status + " : " + response.statusText
    );
  try {
    result = await response.json();
  } catch (err) {
    result = await response.text();
  }
  return result;
}
