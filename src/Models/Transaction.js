let Transaction = (id, txIns, txOuts) => {
    this.Id = id
    this.TxIns = txIns
    this.TxOuts = txOuts

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

module.exports = { Transaction, TxIn, TxOut }