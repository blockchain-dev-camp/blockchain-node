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