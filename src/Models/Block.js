const crypto = require('./Crypto')
class Block {
    constructor(index, blockHash, previousHash, timestamp, difficulty, nounce, transactions, minedBy) {
        this.index = index
        this.transactions = transactions
        this.transactionsHash = crypto.calculateSHA256(transactions)    
        this.difficulty = difficulty
        this.prevBlockHash = previousHash
        this.minedBy = minedBy
        this.nounce = nounce
        this.dateCreated = new Date(timestamp)
        this.blockHash = blockHash
        this.timestamp = timestamp
    }

    calculateHashForBlock() {
        let hashForMiner = crypto.calculateSHA256(
            this.prevBlockHash,
            this.index,
            this.difficulty,
            this.transactionsHash,
            this.minedBy
    )

        let wholeHash = crypto.calculateSHA256(
            hashForMiner,
            this.timestamp,
            this.nounce)
        return wholeHash
    }

}

module.exports = Block
