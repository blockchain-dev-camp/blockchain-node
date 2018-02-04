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
module.exports =  Transaction