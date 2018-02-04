const CryptoJS = require('crypto-js')
const ecdsa = require('elliptic')
const _ = require('lodash')

const ec = new ecdsa.ec('secp256k1');


const COINBASE_AMOUNT = 50;




let getTransactionId = function (transaction) {
    let txInContent = transaction.TxIns
        .map(txIn => txIn.TxOutId + txIn.TxOutIndex)
        .reduce((a, b) => a + b, '');

    let txOutContent = transaction.TxOuts
        .map(txOut => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, '');

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
};

let signTxIn = function (transaction, txInIndex, privateKey, unspentTxOuts /* UnspentTxOut[] */) {
    const txIn = transaction.TxIns[txInIndex];
    const dataToSign = transaction.Id;
    const referencedUnspentTxOut = findUnspentTxOut(txIn.TxOutId, txIn.TxOutIndex, unspentTxOuts);
    const referencedAddress = referencedUnspentTxOut.Address;
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature = toHexString(key.sign(dataToSign).toDER());

    return signature;
};


let UnspentTxOut = require('./Models/Transaction').UnspentTxOut

let updateUnspentTxOuts = function (newTransactions, aUnspentTxOuts) {
    let newUnspentTxOuts = newTransactions
        .map(t => t.TxOuts.map((txOut, index) => UnspentTxOut(t.Id, index, txOut.Address, txOut.Amount)))
        .reduce((a, b) => a.concat(b), []);

    let consumedTxOuts = newTransactions
        .map(t => t.TxIns)
        .reduce((a, b) => a.concat(b), [])
        .map(txIn => UnspentTxOut(txIn.TxOutId, txIn.TxOutIndex, '', 0));

    let resultingUnspentTxOuts = aUnspentTxOuts
        .filter(uTxO => !findUnspentTxOut(uTxO.TxOutId, uTxO.TxOutIndex, consumedTxOuts))
        .concat(newUnspentTxOuts);

    return resultingUnspentTxOuts;
};

let findUnspentTxOut = function (transactionId, index, aUnspentTxOuts) {
    return aUnspentTxOuts.find(uTxO => uTxO.TxOutId === transactionId && uTxO.TxOutIndex === index);
};

let isValidTransactionStructure = function (transaction) {
    let result = true

    if (typeof transaction.Id !== 'string') {
        console.log('transactionId missing');
        result = false;
    }
    else if (!(transaction.TxIns instanceof Array)) {
        console.log('invalid txIns type in transaction');
        result = false;
    }
    else if (!transaction.TxIns.map(isValidTxInStructure).reduce((a, b) => (a && b), true)) {
        result = false;
    }
    else if (!(transaction.TxOuts instanceof Array)) {
        console.log('invalid txIns type in transaction');
        result = false;
    }
    else if (!transaction.TxOuts.map(isValidTxOutStructure).reduce((a, b) => a && b, true)) {
        result = false;
    }

    return result
};

let isValidTxInStructure = function (txIn) {
    let result = true

    if (txIn == null) {
        console.log('txIn is null');
        result = false;
    }
    else if (typeof txIn.Signature !== 'string') {
        console.log('invalid signature type in txIn');
        result = false;
    }
    else if (typeof txIn.TxOutId !== 'string') {
        console.log('invalid txOutId type in txIn');
        result = false;
    }
    else if (typeof txIn.TxOutIndex !== 'number') {
        console.log('invalid txOutIndex type in txIn');
        result = false;
    }

    return result
};

let validateTransaction = function (transaction, aUnspentTxOuts) {
    if (getTransactionId(transaction) !== transaction.Id) {
        console.log('invalid tx id: ' + transaction.Id);
        return false;
    }

    let hasValidTxIns = transaction.TxIns
        .map(txIn => validateTxIn(txIn, transaction, aUnspentTxOuts))
        .reduce((a, b) => a && b, true);

    if (!hasValidTxIns) {
        console.log('some of the txIns are invalid in tx: ' + transaction.Id);
        return false;
    }

    let totalTxInValues = transaction.TxIns
        .map(txIn => getTxInAmount(txIn, aUnspentTxOuts))
        .reduce((a, b) => a + b, 0);

    let totalTxOutValues = transaction.TxOuts
        .map(txOut => txOut.amount)
        .reduce((a, b) => a + b, 0);

    if (totalTxOutValues !== totalTxInValues) {
        console.log('totalTxOutValues !== totalTxInValues in tx: ' + transaction.Id);
        return false;
    }

    return true;
};

let validateTxIn = function (txIn, transaction, aUnspentTxOuts) {
    let referencedUTxOut = aUnspentTxOuts.find(uTxO => uTxO.TxOutId === txIn.TxOutId &&
        uTxO.TxOutIndex === txIn.TxOutIndex);
    if (referencedUTxOut == null) {
        console.log('referenced txOut not found: ' + JSON.stringify(txIn));
        return false;
    }

    let address = referencedUTxOut.Address;
    const key = ec.keyFromPublic(address, 'hex');

    return key.verify(transaction.Id, txIn.Signature);
};

let validateCoinbaseTx = function (transaction, blockIndex) {
    let result = true

    if (getTransactionId(transaction) !== transaction.Id) {
        console.log('invalid coinbase tx id: ' + transaction.Id);
        result = false;
    }
    else if (transaction.TxIns.length !== 1) {
        console.log('one txIn must be specified in the coinbase transaction');
        result = false;
    }
    else if (transaction.TxIns[0].TxOutIndex !== blockIndex) {
        console.log('the txIn index in coinbase tx must be the block height');
        result = false;
    }
    else if (transaction.TxOuts.length !== 1) {
        console.log('invalid number of txOuts in coinbase transaction');
        result = false;
    }
    else if (transaction.TxOuts[0].Amount !== COINBASE_AMOUNT) {
        console.log('invalid coinbase amount in coinbase transaction');
        result = false;
    }
    return result;
};

module.exports = {
    signTxIn,
    getTransactionId,
}
