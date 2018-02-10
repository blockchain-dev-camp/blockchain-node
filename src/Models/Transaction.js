const crypto = require('./Crypto')

class Transaction {
    constructor(fromAddress,
                toAddress,
                transactionValue,
                senderPubKey,
                senderSignature,
                dateOfSign,
                feePercent
                ) {
        // From: address
        this.fromAddress = fromAddress;

        // To: address
        this.toAddress = toAddress;

        // Value: number
        this.value = transactionValue

        this.usedValue = transactionValue - transactionValue * feePercent;
        this.fee = transactionValue * feePercent

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
            this.dateReceived,
            this.fee
        )
        //number
        let message = this.fromAddress + this.toAddress + this.value;
        let signatureCheck = crypto.checkSign(message, this.senderSignature, this.senderPubKey)
        if(!signatureCheck)throw new Error("Signature Fail")
    }


    static signTransaction(fromAd, toAd, ammount, privateKey,fee) {
        let privateKeyBuffer = Buffer.from(privateKey, 'hex')
        let publicKey =  crypto.getPublicKey(privateKeyBuffer).toString('hex')
        let date = new Date().getTime()
        let message = fromAd + toAd + ammount
        let signature = crypto.sign(message, privateKey)
        let signatureCheck = crypto.checkSign(message,signature,publicKey)
        if(!signatureCheck)throw new Error("Signature Fail")
        let hexSignature = crypto.convertUIntToHex(signature)
        let signedTransaction = new Transaction(fromAd, toAd, ammount, publicKey, hexSignature, date,fee)
        return signedTransaction
    };

}

module.exports = Transaction