const crypto = require('./Crypto')
class Block {
    constructor(index, blockHash, previousHash, timestamp, difficulty, nounce, transactions, minedBy) {
        this.index = index
        transactions.forEach(transaction => {
            transaction.paid = true
        });
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

    static calculateHashForBlock(block) {
        let hashForMiner = crypto.calculateSHA256(
            block.prevBlockHash,
            block.index,
            block.difficulty,
            block.transactionsHash,
            block.minedBy);

        let wholeHash = crypto.calculateSHA256(
            hashForMiner,
            block.timestamp,
            block.nounce);
            
        return wholeHash;
    }
}

module.exports = Block
