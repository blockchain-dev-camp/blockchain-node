const CryptoJS = require('crypto-js')
const ecdsa = require('elliptic')
const _ = require('lodash')
const ec = new ecdsa.ec('secp256k1')


const Block = require('./Block')

class Transaction {
    constructor(fromAddress,
                toAddress,
                transactionValue,
                senderPubKey,
                senderSignature,
                dateReceived
                )
    {
        // From: address
        this.fromAddress = fromAddress;

        // To: address
        this.toAddress = toAddress;

        // Value: number
        this.value = transactionValue;

        // SenderPubKey: hex_number
        this.senderPubKey = senderPubKey;

        // SenderSignature: hex_number[2]
        this.senderSignature = senderSignature;

        // DateReceived: timestamp
        this.dateReceived = dateReceived;

        // MinedInBlockIndex: number
        this.minedInBlockIndex = undefined;

        // Paid: bool
        this.paid = false;

        // TransactionHash: hex_number
        this.transactionHash = Block.calculateHash(
            fromAddress,
            toAddress,
            transactionValue,
            senderPubKey,
            senderSignature,
            dateReceived
        )

    }

    checkSignValidity(){
//Todo
    }
}
//module.exports =  Transaction

//Elvis Logic

let Transaction = (id) => {
    this.Id = id
    this.TxIns = []
    this.TxOuts = []

    return this
}

let TxIn = (txOutId, txOutIndex, signature) => {
    this.TxOutId = txOutId
    this.TxOutIndex = txOutIndex
    this.Signature = signature

    return this
}

let TxOut = (address, amount) => {
    this.Address = address
    this.Amount = amount

    return this
}

let UnspentTxOut = (txOutId, txOutIndex, address, amount) => {
    this.TxOutId = txOutId;
    this.TxOutIndex = txOutIndex;
    this.Address = address;
    this.Amount = amount;

    return this
}

module.exports = { Transaction, TxIn, TxOut, UnspentTxOut }