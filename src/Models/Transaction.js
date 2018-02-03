class Transaction {
    constructor(id) {
        this.Id = id
        this.TxIns = []
        this.TxOuts = []
    }


    TxIn(txOutId, txOutIndex, signature) {
        this.TxOutId = txOutId
        this.TxOutIndex = txOutIndex
        this.Signature = signature
    }

    TxOut(address, amount) {
        this.Address = address
        this.Amount = amount
    }
}
module.exports =  Transaction