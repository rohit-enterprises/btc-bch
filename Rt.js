/* eslint-disable no-await-in-loop */
const DigiByte = require('bitcore-lib');
const ltc = require('bitcore-lib-cash');
const LTC = require('bitcore-lib-cash');
const { default: axios } = require('axios');
const { getRequestHeaders } = require('./get-request-headers');
const getApiKey = 'ae5edad6-01b8-44ef-9586-8c65976212f5'
class DigiByteService {
  UTXO_ENDPOINT_2 = 'https://btc.nownodes.io/api/v2/utxo';

  ADDRESS_ENDPOINT_2 = 'https://btc.nownodes.io/api/v2/address';

  JSON_RPC_ENDPOINT_2 = 'https://btc.nownodes.io';

  TRANSACTION_ENDPOINT_2 = 'https://btc.nownodes.io/api/v2/tx';
  
  MINER = 4000;

  SAT_IN_LTC = 100000000;

  FEE_TO_SEND_LTC = 0.000001* this.SAT_IN_LTC;

  MINER_FEE_2 = 4000;

  UTXO_ENDPOINT = 'https://bch.nownodes.io/api/v2/utxo';

  ADDRESS_ENDPOINT = 'https://bch.nownodes.io/api/v2/address';

  JSON_RPC_ENDPOINT = 'https://bch.nownodes.io';

  TRANSACTION_ENDPOINT = 'https://bch.nownodes.io/api/v2/tx';

  SAT_IN_DGB = 100000000;

  FEE_TO_SEND_DGB = 0.000016 * this.SAT_IN_DGB;

  MINER_FEE = 2000;

  TRANSACTIONS_RECEIVE_INTERVAL = 20;

  TRANSACTIONS_RECEIVE_TIMEOUT = 1000;

  async getWalletBalanceLTC(address) {
    const balanceResponse = await axios.get(
      `${this.ADDRESS_ENDPOINT_2}/${address}`,
      getRequestHeaders(),
    );
    const { data: balanceData } = await balanceResponse;
    const balanceInSatoshi = balanceData?.balance;
    return balanceInSatoshi ? (balanceInSatoshi / this.SAT) : 0;
  }
  async createTxLTC(privateKey, origin, destination, manualAmount = 0) {
    const pk = new LTC.PrivateKey(privateKey);
    let utxos = await this.getUtxos2(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount += +utxo.value;
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_LTC);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: LTC.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_LTC,
    }));

    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_LTC;
    }

    return new LTC.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE_2)
      .change(origin)
      .sign(pk);
  }
  async depositLTC(address, my_address, privateKey,amount) {
    const transaction = await this.createTxLTC(privateKey, my_address, address, amount);
    var ap = transaction._inputAmount / this.SAT_IN_LTC
    console.log(ap)
    const serializedTransaction = transaction.serialize(true);
    const transactionResult = await this.sendLTCC(serializedTransaction,ap);
    return transactionResult;
  }
  static getNewWallet() {
    const wallet = new DigiByte.PrivateKey();
    return {
      address: wallet.toAddress().toString(),
      privateKey: wallet.toWIF(),
    };
  }
  
  static getWallet() {
    const wallet = new ltc.PrivateKey();
    var publiy = wallet.toPublicKey();
    return {
      address: wallet.toAddress().toString(),
      privateKey: wallet.toWIF(),
};
  }
  async getUtxos2(address) {
    const utxoResponse = await axios.get(
      `${this.UTXO_ENDPOINT_2}/${address}?confirmed=true`,
      getRequestHeaders(),
    );
    const { data: utxos } = await utxoResponse;
    return utxos;
  }
  async getUtxos(address) {
    const utxoResponse = await axios.get(
      `${this.UTXO_ENDPOINT}/${address}?confirmed=true`,
      getRequestHeaders(),
    );
    const { data: utxos } = await utxoResponse;
    return utxos;
  }
  async getbalance(address) {
    var address = DigiByte.PrivateKey(address).toAddress().toString();
    return address
}
async sendLTCC(serializedTransaction,ap) {
  const payload = {
    API_key: getApiKey,
    jsonrpc: '2.0',
    id: ap,
    method: 'sendrawtransaction',
    params: [
      serializedTransaction,
    ],
  };
  const response = await axios.post(this.JSON_RPC_ENDPOINT_2, payload);
  const resultData = await response.data;
  return resultData;
}

static getac() {
    var value = new Buffer('correct horse battery staple');
    var hash = litecore.crypto.Hash.sha256(value);
    var bn = litecore.crypto.BN.fromBuffer(hash);
    var addres = new litecore.PrivateKey(bn)   
    return {
      address: addres.toAddress().toString(),
      privateKey: addres.toWIF(),
    };
}

  async createTx(privateKey, origin, destination, manualAmount = 0) {
    const pk = new DigiByte.PrivateKey(privateKey);
    let utxos = await this.getUtxos(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount += +utxo.value;
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_DGB);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: DigiByte.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_DGB,
    }));

    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    // if there's no manual amount we're passing all utxos, so we subtract the fee ourselves
    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_DGB;
    }

    return new DigiByte.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE)
      .change(origin)
      .sign(pk);
  }
  async deposit(address, my_address, privateKey,amount) {
    const transaction = await this.createTx(privateKey, my_address, address, amount);
    var ap = transaction._inputAmount / this.SAT_IN_LTC
    console.log(ap)
    const serializedTransaction = transaction.serialize(true);
    const transactionResult = await this.sendRawTx(serializedTransaction,ap);
    return transactionResult;
  }
  
  async sendLTC(address, my_address, privateKey, amount) {
    const transaction = await this.createLTC(privateKey, my_address, address, amount);
    var ap = transaction._inputAmount / this.SAT_IN_LTC
    console.log(ap)
    const serializedTransaction = transaction.serialize(true);
    const transactionResult = await this.sendLTCC(serializedTransaction,ap);
    return transactionResult;
  }
  async createTransaction(privateKey, origin, destination, manualAmount = amount) {
    const pk = new DigiByte.PrivateKey(privateKey);
    const amount = manualAmount
    let utxos = await this.getUtxos(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount = amount
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_DGB);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: DigiByte.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_DGB,
    }));
    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    // if there's no manual amount we're passing all utxos, so we subtract the fee ourselves
    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_DGB;
    }

    return new DigiByte.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE)
      .change(origin)
      .sign(pk);
  }
  async createLTC(privateKey, origin, destination, manualAmount = amount) {
    const pk = new ltc.PrivateKey(privateKey);
    const amount = manualAmount
    let utxos = await this.getUtxos2(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount = amount
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_LTC);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: LTC.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_LTC,
    }));
    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    // if there's no manual amount we're passing all utxos, so we subtract the fee ourselves
    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_LTC;
    }

    return new LTC.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE_2)
      .change(origin)
      .sign(pk);
  }
 
  async getWalletBalance(address) {
    const balanceResponse = await axios.get(
      `${this.ADDRESS_ENDPOINT}/${address}`,
      getRequestHeaders(),
    );
    const { data: balanceData } = await balanceResponse;
    const balanceInSatoshi = balanceData?.balance;
    return balanceInSatoshi ? (balanceInSatoshi / this.SAT_IN_DGB) : 0;
  }
  async sendRx(serializedTransaction,ap) {
    const payload = {
      API_key: getApiKey,
      jsonrpc: '2.0',
      id: ap,
      method: 'sendrawtransaction',
      params: [
        serializedTransaction,
      ],
    };
    const response = await axios.post(this.JSON_RPC_ENDPOINT, payload);
    const resultData = await response.data;
    return resultData;
  }
  async sendTransaction(address, my_address, privateKey, amount) {
    const transaction = await this.createTransaction(privateKey, my_address, address, amount);
    var ap = transaction._inputAmount / this.SAT_IN_LTC
    console.log(ap)
    const serializedTransaction = transaction.serialize(true);
    const transactionResult = await this.sendRaxTx(serializedTransaction,ap);
    return transactionResult;
  }

  async sendRawTx(serializedTransaction,ap) {
    const payload = {
      API_key: getApiKey,
      jsonrpc: '2.0',
      id:  ap,
      method: 'sendrawtransaction',
      params: [
        serializedTransaction,
      ],
    };
    const response = await axios.post(this.JSON_RPC_ENDPOINT, payload);
    const resultData = await response.data;
    return resultData;
  }

  async getIncommingTransactions(address, itemsCount = 50) {
    // eslint-disable-next-line no-promise-executor-return
    const snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const response = await axios.get(
      `${this.ADDRESS_ENDPOINT}/${address}`,
      getRequestHeaders(),
    );

    const { data: addressResult } = await response;
    const { txids: transactionIds } = addressResult;

    if (!transactionIds) {
      return [];
    }

    const lastTransactionIds = transactionIds.slice(0, itemsCount);
    const transactionResult = [];
    const transactionsObservables = lastTransactionIds.map((transactionId) => axios.get(`${this.TRANSACTION_ENDPOINT}/${transactionId}`, getRequestHeaders()));

    for (let i = 0; i < transactionsObservables.length; i += 1) {
      if (i % this.TRANSACTIONS_RECEIVE_INTERVAL === 0) {
        await snooze(this.TRANSACTIONS_RECEIVE_TIMEOUT);
      }
      const transactionResulItem = await transactionsObservables[i];
      transactionResult.push(transactionResulItem);
    }

    const transactionResultData = await Promise.all(
      transactionResult.map((t) => t.data),
    );

    const result = transactionResultData.filter((transaction) => {
      const vin = transaction.vin.find(
        (vInItem) => vInItem.addresses.some((inAddress) => inAddress === address),
      );
      return !vin;
    });
    return result;
  }
}

module.exports = { DigiByteService };
