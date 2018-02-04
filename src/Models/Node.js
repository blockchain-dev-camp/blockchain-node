
class Node {
    constructor(blockChain, difficulty) {
        this.Peers = [] // URL[]
        this.blockChain = blockChain // blockChain
        this.PendingTransactions = [] // Transaction[]
        this.Balances = {} // map(address => number)
        this.Difficulty = difficulty // number
        this.MiningJobs = {} // map(address => Block)
    }

    addTransactions(tx) {
        this.PendingTransactions.push(tx)
    }

    getTransactions() {
        return this.PendingTransactions
    }
}

module.exports = Node

