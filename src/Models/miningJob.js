const crypto = require('./Crypto')

class MiningJob {
    constructor(index, expectedReward, transactions, transactionsHash, prevBlockHash, difficulty, address) {
        this.index = index
        this.reward = expectedReward
        this.transactions = transactions
        this.transactionsHash = transactionsHash
        this.prevBlockHash = prevBlockHash
        this.difficulty = difficulty
        this.address = address
        this.hashForMiner = crypto.calculateSHA256(
            this.prevBlockHash,
            this.index,
            this.difficulty,
            this.transactionsHash,
            this.address
        )
    }
}

module.exports = MiningJob