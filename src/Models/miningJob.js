class MiningJob {
    constructor(index, expectedReward, transactions, transactionsHash, prevBlockHash, difficulty, address) {
        this.index = index
        this.reward = expectedReward
        this.transactions = transactions
        this.transactionsHash = transactionsHash
        this.prevBlockHash = prevBlockHash
        this.difficulty = difficulty
        this.address = address
    }
}

module.exports = MiningJob