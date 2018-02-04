const cryptoJs = require('crypto-js')

class Block {
    constructor(index, blockHash, previousHash, timestamp, data, difficulty, nounce, transactions, minedBy) {
        this.index = index
        this.transactions = transactions
        this.transactionsHash = Block.calculateHash(transactions)
        this.difficulty = difficulty
        this.prevBlockHash = previousHash
        this.minedBy = minedBy
        this.blockDataHash = Block.calculateHash(data)
        this.nounce = nounce
        this.dateCreated = new Date(timestamp)
        this.blockHash = blockHash
        this.timestamp = timestamp
        this.data = data
    }

    calculateHashForBlock() {
        let hashForMiner = Block.calculateHash(
            this.prevBlockHash,
            this.index,
            this.data,
            this.difficulty,
            this.transactionsHash)

        let wholeHash = Block.calculateHash(
            hashForMiner,
            this.minedBy,
            this.timestamp,
            this.nounce)
        return wholeHash
    }

    static calculateHash(...arg) {
        return cryptoJs.SHA256(arg.join("")).toString()
    }
}

module.exports = Block
