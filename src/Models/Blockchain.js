const broadcastLatest = require('../P2PServer').broadcastLatest
const Block = require('./Block')
const crypto = require('./Crypto')

class Blockchain {
    constructor() {
        this.genesisBlock = new Block(0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', new Date(), [], 0, 0);
        this.blockchain = [this.genesisBlock];
    }
    getBlockchain() {
        return this.blockchain;
    }

    getLatestBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    generateNextBlock(blockData) {
        //pool part for hash
        let previousBlock = this.getLatestBlock()
        let nextIndex = previousBlock.index + 1
        let data = blockData
        let difficulty = 4
        let transactions = []
        let transactionHash = crypto.calculateSHA256(transactions)

        let wholeHashForMiner = crypto.calculateSHA256(
            previousBlock.blockHash,
            nextIndex,
            data,
            difficulty,
            transactionHash);

        //miner part of hash
        let nextData = this.mine(wholeHashForMiner, difficulty)
        let newBlock = new Block(nextIndex, nextData.nextBlockHash, previousBlock.blockHash, nextData.nextTimestamp, blockData, difficulty, nextData.nounce, transactions, nextData.mineBy);
        return newBlock;
    }

    mine(wholeHashForMiner, difficulty) {
        let mineBy = "pencho"
        let nounceIsFind = false
        //Start mining
        let nounce, nextTimestamp, nextBlockHash
        while (!nounceIsFind) {
            nounce = Math.floor((Math.random() * 100000) + 1);
            nextTimestamp = new Date().getTime();
            nextBlockHash =
                crypto.calculateSHA256(
                    wholeHashForMiner,
                    mineBy,
                    nextTimestamp,
                    nounce);
            if (nextBlockHash.substr(0, difficulty) === Array(difficulty + 1).join("0")) {
                nounceIsFind = true
            }
        }
        return {nextBlockHash,nounce,mineBy,nextTimestamp}
    }

    addBlock(newBlock) {
        if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blockchain.push(newBlock);
        }
    }

    isValidBlockStructure(block) {
        return typeof block.index === 'number'
            && typeof block.blockHash === 'string'
            && typeof block.prevBlockHash === 'string'
            && typeof block.timestamp === 'number'
            // && typeof block.data === 'string';
    }
    ;

    isValidNewBlock(newBlock, previousBlock) {
        let result = true

        if (!this.isValidBlockStructure(newBlock)) {
            console.log("Invalid block structure")
            result = false
        }
        else if (previousBlock.index + 1 !== newBlock.index) {
            console.log("Invalid index")
            result = false
        }
        else if (previousBlock.blockHash !== newBlock.prevBlockHash) {
            console.log('invalid previoushash');
            result = false
        }
        else if ((newBlock.calculateHashForBlock()) !== newBlock.blockHash) {
            console.log('Invalid hash');
            result = false
        }

        return result
    }
    ;

    isValidChain(blockchainToValidate) {
        let isValidGenesis = function (block) {
            return JSON.stringify(block) === JSON.stringify(this.genesisBlock);
        };

        let result = true
        if (!isValidGenesis(blockchainToValidate[0])) {
            result = false;
        }

        for (let i = 1; i < blockchainToValidate.length; i++) {
            let newBlock = blockchainToValidate[i]
            let prevBlock = blockchainToValidate[i - 1]
            if (!isValidNewBlock(newBlock, prevBlock)) {
                result = false;
                break
            }
        }

        return result
    }
    ;

    addBlockToChain(newBlock) {
        let result = false
        if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blockchain.push(newBlock);
            result = true
        }

        return result
    }
    ;

    replaceChain(newBlocks) {
        if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blockchain = newBlocks;
            broadcastLatest();
        }
        else {
            console.log('Received blockchain invalid');
        }
    }
    ;
}

module
    .exports = Blockchain