let MiningJob = require('./miningJob')
const crypto = require('./Crypto')
let Transaction = require('./Transaction')

class Node {
    constructor(blockChain, difficulty) {
        let keysForNode = crypto.generateKeys()
        let keysForGod = crypto.generateKeys()
        this.Peers = [] // URL[]
        this.blockChain = blockChain // blockChain
        this.PendingTransactions = [] // Transaction[]
        this.Difficulty = difficulty // number
        this.MiningJobs = new Map() // map(address => Block)
        this.privateKey = keysForNode[0]
        this.publicKey = keysForNode[1]
        this.address = crypto.publiKeyToAddres(this.publicKey)
        this.feePercent = 0.01 //1%
        this.blockGodReward = 20
        this.godPvKey = 'd959e344b2b7fff9203f014b45e8d0bf3ff3625eb48b30e60d9c86560ec4c9d7'
        this.godPbKey = '03f6decc12e6c1ce70b74fa71f1b897210a31163df2914e6a39f89cbc923d18f61'
        this.godAddress = crypto.publiKeyToAddres(this.godPbKey)
        this.Balances = {} // map(address => number)
        this.Balances[this.godAddress]=1000000000


    }

    addTransactions(tx) {
        this.PendingTransactions.push(tx)
    }

    getTransactions() {
        return this.PendingTransactions
    }

    calculateReward() {
        let transactionsFee = 0
        for (let i = 0; i < this.PendingTransactions.length; i++) {
            let fee = this.PendingTransactions[i].fee
            transactionsFee += fee
        }
        let reward = this.blockGodReward + transactionsFee
        return reward
    }

    getMiningJob(index, award, address, difficulty) {
        let transactions = this.getTransactions().slice()
        let rewardForPool = this.feePercent * award
        let rewardForMiner = award - rewardForPool


        let poolTransactionReward = Transaction.signTransaction(this.godAddress, this.address, award, this.godPvKey, 0)
        let minerTransactionReward = Transaction.signTransaction(this.address, address, rewardForMiner, this.privateKey, 0)
        transactions.push(poolTransactionReward)
        transactions.push(minerTransactionReward)
        let transactionHash = crypto.calculateSHA256(transactions)
        let prevBlockHash = this.blockChain.getLatestBlock().blockHash
        let job = new MiningJob(index, award, transactions, transactionHash, prevBlockHash, difficulty, address)
        this.MiningJobs.set(address, job)
        let hashForMiner = crypto.calculateSHA256(
            job.prevBlockHash,
            job.index,
            job.difficulty,
            job.transactionsHash,
            job.address
        )

        return hashForMiner
    }

    checkMiningJob(address, nounce, dateCreated, blockHash) {
        let miningJob = this.MiningJobs.get(address)
        if (!miningJob) throw new Error("No Job for this address")
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
        if (wholeHash === blockHash) {
            let rr = this.MiningJobs.delete(address)
            this.balanceUpdate()
            return miningJob
        }

        return false
    }

    balanceUpdate() {
        let blocks = this.blockChain.blocks
        let balances = this.Balances
        for (let i = 0; i < blocks.length; i++) {
            let transactions = blocks[i].transactions
            for (let j = 0; j < transactions.length; j++) {
                let transaction = transactions[j]
                if (!balances[transaction.toAddress])
                    balances[transaction.toAddress] = 0
                if (!balances[transaction.fromAddress])
                    balances[transaction.fromAddress] = 0
                balances[transaction.fromAddress] -= transaction.value
                balances[transaction.toAddress] += transaction.value
            }
        }
    }

    getBalance(address) {
        return this.Balances
    }
}

module.exports = Node

