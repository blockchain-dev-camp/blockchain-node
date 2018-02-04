const crypto = require('./Crypto')
class Block {
    constructor(index, blockHash, previousHash, timestamp, data, difficulty, nounce, transactions, minedBy) {
        this.index = index
        this.transactions = transactions
        this.transactionsHash = crypto.calculateSHA256(transactions)
        this.difficulty = difficulty
        this.prevBlockHash = previousHash
        this.minedBy = minedBy
        this.blockDataHash = crypto.calculateSHA256(data)
        this.nounce = nounce
        this.dateCreated = new Date(timestamp)
        this.blockHash = blockHash
        this.timestamp = timestamp
        this.data = data
    }

    calculateHashForBlock() {
        let hashForMiner = crypto.calculateSHA256(
            this.prevBlockHash,
            this.index,
            this.data,
            this.difficulty,
            this.transactionsHash)

        let wholeHash = crypto.calculateSHA256(
            hashForMiner,
            this.minedBy,
            this.timestamp,
            this.nounce)
        return wholeHash
    }

}

module.exports = Block
