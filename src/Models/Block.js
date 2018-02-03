class Block {
    constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
        this.index = index
        this.Transactions = []
        this.difficulty = difficulty
        this.prevBlockHash = previousHash.toString()
        this.minedBy = ""
        this.blockDataHash = hash.toString()
        this.nonce = nonce
        this.dateCreated = new Date(timestamp)
        this.blockHash = hash.toString()

        this.timestamp = timestamp
        this.data = data
    }



}

module.exports = Block
