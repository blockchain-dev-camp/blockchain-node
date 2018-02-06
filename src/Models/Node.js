let MiningJob = require('./miningJob')
const crypto = require('./Crypto')
let Transaction = require('./Transaction')

class Node {
    constructor(blockChain, difficulty) {
        let keys = crypto.generateKeys()

        this.Peers = [] // URL[]
        this.blockChain = blockChain // blockChain
        this.PendingTransactions = [] // Transaction[]
        this.Balances = {} // map(address => number)
        this.Difficulty = difficulty // number
        this.MiningJobs = {} // map(address => Block)
        this.privateKey = keys[0]
        this.publicKey = keys[1]
        this.address = crypto.publiKeyToAddres(this.publicKey)
    }

    addTransactions(tx) {
        this.PendingTransactions.push(tx)
    }

    getTransactions() {
        return this.PendingTransactions
    }

    calculateAward() {
        let award = (this.PendingTransactions.length + 1) * this.Difficulty
        return award
    }

    getMiningJob(index, award, address, difficulty) {
        let transactions = this.getTransactions().slice()
        let minerTransactionAward = Transaction.signTransaction(this.address, address, award, this.privateKey)
        transactions.push(minerTransactionAward)
        let transactionHash = crypto.calculateSHA256(transactions)
        let prevBlockHash = this.blockChain.getLatestBlock().blockHash
        let job = new MiningJob(index, award, transactions, transactionHash, prevBlockHash, difficulty, address)
        this.MiningJobs[address] = job
        let hashForMiner = crypto.calculateSHA256(
            job.prevBlockHash,
            job.index,
            job.difficulty,
            job.transactionsHash,
            job.address
        )

        return hashForMiner
    }
    checkMiningJob(address,nounce,dateCreated,blockHash){
        let miningJob = this.MiningJobs[address]
        if(!miningJob)throw new Error("No Job for this address")
        let hashForMiner = crypto.calculateSHA256(
            miningJob.prevBlockHash,
            miningJob.index,
            miningJob.difficulty,
            miningJob.transactionsHash,
            miningJob.address
        )

        let wholeHash = crypto.calculateSHA256(
            hashForMiner,
            dateCreated,
            nounce)
        if(wholeHash===blockHash)return miningJob
        return false
    }
}

module.exports = Node

