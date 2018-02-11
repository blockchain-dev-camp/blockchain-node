let MiningJob = require('./miningJob')
const crypto = require('./Crypto')
let Transaction = require('./Transaction')
const MONEY_IN_CIRCULATION = 1000000000

class Node {
    constructor(blockChain, difficulty) {
        let keysForNode = crypto.generateKeys()
        this.Peers = [] // URL[]
        this.blockChain = blockChain // blockChain
        this.PendingTransactions = [] // Transaction[]
        this.Difficulty = difficulty // number
        this.MiningJobs = new Map() // map(address => Block)
        this.privateKey = keysForNode.privateKey
        this.publicKey = keysForNode.publicKey
        this.address = keysForNode.address
        this.feePercent = 0.01 //1%
        this.blockGodReward = 20
        this.godPvKey = '57da87852534fc39cec621550a0b701e18132b92f924172ace529490ebdafb04'
        this.godPbKey = '04c5c2a12455a2712b2d0d42d0ad13f47764a19fcae3975974111d38428c2bd6f3864a1424d6fba5b05868d2b4f89931a4aac53b714efe4ce00f5dc830089c2d72'
        this.godAddress = crypto.publiKeyToAddres(this.godPbKey)
        this.balances = {} // map(address => number)
        this.allTransactions = {};

        // Genesis transactions 
        let faucetAddress = '44a161dd6354d38eef62e571888a2d8c0d81a73c'
        let transaction = Transaction.signTransaction(this.godAddress, faucetAddress, 1000, this.godPvKey, 0)
        transaction.paid = true
        this.PendingTransactions.push(transaction)
    }

    clearTransactions() {
        this.PendingTransactions = [];
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
        let reward = {blockReward: this.blockGodReward, feeReward: transactionsFee}
        return reward
    }

    mineAddress(address) {
        if (!this.PendingTransactions.length) {
            return false;
        }

        let index = this.blockChain.blocks.length;
        let transactionsIncluded = this.PendingTransactions.length;
        let difficulty = this.Difficulty;
        let miningJob = this.getMiningJob(index, address, difficulty);
        return {
            index: miningJob.index,
            transactionsIncluded: transactionsIncluded,
            expectedReward: miningJob.reward,
            difficulty: difficulty,
            blockDataHash: miningJob.hashForMiner
        }
    }

    getMiningJob(index, address, difficulty) {
        let reward = this.calculateReward()
        let transactions = this.getTransactions().slice()
        let rewardForPool = this.feePercent * reward.blockReward + reward.feeReward
        let rewardForMiner = reward.blockReward - rewardForPool


        let poolTransactionRewardFee = Transaction.signTransaction(this.godAddress, this.address, reward.feeReward, this.godPvKey, 0)
        let poolTransactionReward = Transaction.signTransaction(this.godAddress, this.address, reward.blockReward, this.godPvKey, 0)
        let minerTransactionReward = Transaction.signTransaction(this.address, address, rewardForMiner, this.privateKey, 0)
        transactions.push(poolTransactionReward)
        transactions.push(poolTransactionRewardFee)
        transactions.push(minerTransactionReward)
        transactions.forEach(x => {
            x.paid = true;
            x.minedInBlockIndex = index;
        })

        let transactionHash = crypto.calculateSHA256(transactions)
        let prevBlockHash = this.blockChain.getLatestBlock().blockHash
        let job = new MiningJob(index, rewardForMiner, transactions, transactionHash, prevBlockHash, difficulty, address)
        this.MiningJobs.set(address, job)
        return job
    }

    checkMiningJob(address, nounce, dateCreated, blockHash) {
        let miningJob = this.MiningJobs.get(address)
        if (!miningJob) {
            return false;
        }

        let hashForMiner = crypto.calculateSHA256(
            miningJob.prevBlockHash,
            miningJob.index,
            miningJob.difficulty,
            miningJob.transactionsHash,
            miningJob.address
        );

        let wholeHash = crypto.calculateSHA256(
            hashForMiner,
            dateCreated,
            nounce);

        if (!wholeHash === blockHash) {
            return false;
        }

        this.MiningJobs.clear();
        return miningJob;
    }

    balanceUpdate() {
        let blocks = this.blockChain.blocks
        let balances = {}
        balances[this.godAddress] = MONEY_IN_CIRCULATION
        for (let i = 0; i < blocks.length; i++) {
            let transactions = blocks[i].transactions
            for (let j = 0; j < transactions.length; j++) {
                let transaction = transactions[j]
                this.allTransactions[transaction.transactionId] = i
                if (!balances[transaction.toAddress])
                    balances[transaction.toAddress] = 0
                if (!balances[transaction.fromAddress])
                    balances[transaction.fromAddress] = 0
                balances[transaction.fromAddress] -= transaction.value
                balances[transaction.toAddress] += transaction.value
            }
        }
        this.balances = balances
        for (let i = 0; i < this.PendingTransactions.length; i++) {
            let tr = this.PendingTransactions[i];
            let trid = tr.transactionId
            if (this.allTransactions[trid]) {
                let pendingTr = this.PendingTransactions
                while (pendingTr.map(function (e) {
                    return e.transactionId;
                }).indexOf(trid) !== -1) {
                    pendingTr.splice(pendingTr.indexOf(trid), 1);
                }
            }
        }
    }

    getBalance(address) {
        return this.balances
    }

    addBlockToChain(block) {
        this.blockChain.addBlock(block)
        this.balanceUpdate()
    }
}

module.exports = Node

