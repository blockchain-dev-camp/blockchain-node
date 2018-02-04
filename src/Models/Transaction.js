const crypto = require('./Crypto')
var JSONB = require('json-buffer')
var Buffer = require('buffer').Buffer

// var str = JSONB.stringify(new Buffer('hello there!'))
//
// console.log(JSONB.parse(str)) //GET a BUFFER back

// console.log(new RIPEMD160().update('42').digest('hex'))
class Transaction {
    constructor(fromAddress,
                toAddress,
                transactionValue,
                senderPubKey,
                senderSignature,
                dateOfSign) {
        // From: address
        this.fromAddress = fromAddress;

        // To: address
        this.toAddress = toAddress;

        // Value: number
        this.value = transactionValue;

        // SenderPubKey: hex_number
        this.senderPubKey = senderPubKey;

        // SenderSignature: {object|type:,data:}[2] //base64

          this.senderSignature = senderSignature;

        // DateReceived: timestamp
        this.dateReceived = new Date().getTime();

        // DateSigned: timestamp
        this.dateOfSign = dateOfSign

        // MinedInBlockIndex: number
        this.minedInBlockIndex = undefined;

        // Paid: bool
        this.paid = false;

        // TransactionHash: hex_number
        this.transactionId = crypto.calculateSHA256(
            this.fromAddress,
            this.toAddress,
            this.value,
            this.senderPubKey,
            this.senderSignature,
            this.dateReceived
        )
        let message = [this.fromAddress, this.toAddress, this.value,this.dateOfSign]
        let signAsBuffer =(JSONB.parse(this.senderSignature))
        let signatureCheck = crypto.checkSign(message, signAsBuffer, this.senderPubKey)
        let addressFromPublic = crypto.publiKeyToAddres(this.senderPubKey)
        if(addressFromPublic!==this.fromAddress)throw new Error("This is not your address")
        if(!signatureCheck)throw new Error("Signanture Fail")
    }


    static GenerateSignedTransaction(fromAd, toAd, ammount, privateKey) {
        let dataToSign = [fromAd, toAd, ammount]
        let date = new Date().getTime()
        dataToSign.push(date)
        let signature = crypto.sign(dataToSign, privateKey)
        let publicKey = crypto.getPublicKey(privateKey).toString('hex')
        let addressFromPublic = crypto.publiKeyToAddres(publicKey)
        if(addressFromPublic!=fromAd)throw new Error("This is not your address")
        let signatureCheck = crypto.checkSign(dataToSign, signature, publicKey)
        let JSONSgnature = JSONB.stringify(new Buffer(signature))
        let signedTransaction = new Transaction(fromAd, toAd, ammount, publicKey, JSONSgnature, date)
        return signedTransaction
    };

}

module.exports = Transaction

// //Elvis Logic
//
// let Transaction = (id) => {
//     this.Id = id
//     this.TxIns = []
//     this.TxOuts = []
//
//     return this
// }
//
// let TxIn = (txOutId, txOutIndex, signature) => {
//     this.TxOutId = txOutId
//     this.TxOutIndex = txOutIndex
//     this.Signature = signature
//
//     return this
// }
//
// let TxOut = (address, amount) => {
//     this.Address = address
//     this.Amount = amount
//
//     return this
// }
//
// let UnspentTxOut = (txOutId, txOutIndex, address, amount) => {
//     this.TxOutId = txOutId;
//     this.TxOutIndex = txOutIndex;
//     this.Address = address;
//     this.Amount = amount;
//
//     return this
// }
//
//  module.exports = { Transaction, TxIn, TxOut, UnspentTxOut }