const cryptoJs = require('crypto-js')

const broadcastLatest = require('./P2PServer').broadcastLatest
const Block = require('./Models/Block')

class Blockchain {
    constructor() {
        this.blockchain = [this.genesisBlock];
    }

    getBlockchain() {
        return this.blockchain;
    }


    getLatestBlock() {
    }

    generateNextBlock(blockData) {
        let previousBlock = this.getLatestBlock();
        let nextIndex = previousBlock.index + 1;
        let nextTimestamp = new Date().getTime();
        let nextHash = this.calculateHash(nextIndex, previousBlock.blockHash, nextTimestamp, blockData);
        let newBlock = new Block(nextIndex, nextHash, previousBlock.blockHash, nextTimestamp, blockData);
        //this.addBlockToChain(newBlock);
        return newBlock;
    };

    calculateHashForBlock(block) {
        return this.calculateHash(block.index, block.prevBlockHash, block.timestamp, block.data).toString();
    }

    calculateHash(index, previousHash, timestamp, data) {
        // There is no proof of work yet
        return cryptoJs.SHA256(index + previousHash + timestamp + data)
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
            && typeof block.data === 'string';
    };

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
        else if (this.calculateHashForBlock(newBlock) !== newBlock.blockHash) {
            console.log('Invalid hash');
            result = false
        }

        return result
    };

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
    };

    addBlockToChain(newBlock) {
        let result = false
        if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blockchain.push(newBlock);
            result = true
        }

        return result
    };

    replaceChain(newBlocks) {
        if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blockchain = newBlocks;
            broadcastLatest();
        }
        else {
            console.log('Received blockchain invalid');
        }
    };
}

module.exports = Blockchain