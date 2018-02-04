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

<<<<<<< HEAD
let UnspentTxOut = (txOutId, txOutIndex, address, amount) => {
    this.TxOutId = txOutId;
    this.TxOutIndex = txOutIndex;
    this.Address = address;
    this.Amount = amount;

    return this
}

module.exports = { Transaction, TxIn, TxOut, UnspentTxOut }
=======
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
>>>>>>> c77eac3d3fbc15173fae5aaf944d311d08392714
