const crypto = require('./Crypto')

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

        // SenderSignature: hex_number

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
        let signAsBuffer =(crypto.converHexToUint(this.senderSignature))
        let addressFromPublic = crypto.publiKeyToAddres(this.senderPubKey)
        if(addressFromPublic!==this.fromAddress)throw new Error("This is not your address")
        let signatureCheck = crypto.checkSign(message, signAsBuffer, this.senderPubKey)
        if(!signatureCheck)throw new Error("Signature Fail")
    }


    static signTransaction(fromAd, toAd, ammount, privateKey) {
        let date = new Date().getTime()
        let dataToSign = [fromAd, toAd, ammount,date]
        let signature = crypto.sign(dataToSign, privateKey)
        let publicKey = crypto.getPublicKey(privateKey).toString('hex')
        let addressFromPublic = crypto.publiKeyToAddres(publicKey)
        if(addressFromPublic!==fromAd)throw new Error("This is not your address")
        let hexSignature = crypto.convertUIntToHex(signature)
        let signedTransaction = new Transaction(fromAd, toAd, ammount, publicKey, hexSignature, date)
        return signedTransaction
    };

}

module.exports = Transaction