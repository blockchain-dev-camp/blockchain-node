const cryptoJs = require('crypto-js')

const broadcastLatest = require('./P2PServer').broadcastLatest
const Block = require('./Models/Block')


let genesisBlock = Block(0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [], 0, 0);
let blockchain = [genesisBlock];

let getBlockchain = function () {
    return blockchain;
}

let getLatestBlock = function () {
    return blockchain[blockchain.length - 1];
}

let generateNextBlock = function (blockData) {
    let previousBlock = getLatestBlock();
    let nextIndex = previousBlock.Index + 1;
    let nextTimestamp = new Date().getTime() / 1000;
    let nextHash = calculateHash(nextIndex, previousBlock.Hash, nextTimestamp, blockData);
    let newBlock = Block(nextIndex, nextHash, previousBlock.Hash, nextTimestamp, blockData);
    return newBlock;
};

let calculateHashForBlock = function (block) {
    return calculateHash(block.Index, block.PreviousHash, block.Timestamp, block.Data);
}

let calculateHash = function (index, previousHash, timestamp, data) {
    // There is no proof of work yet
    return cryptoJs.SHA256(index + previousHash + timestamp + data)
}

let addBlock = function (newBlock) {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
}

let isValidBlockStructure = function (block) {
    return typeof block.Index === 'number'
        && typeof block.Hash === 'string'
        && typeof block.PreviousHash === 'string'
        && typeof block.Timestamp === 'number'
        && typeof block.Data === 'string';
};

let isValidNewBlock = function (newBlock, previousBlock) {
    let result = true

    if (!isValidBlockStructure(newBlock)) {
        console.log("Invalid block structure")
        result = false
    }
    else if (previousBlock.Index + 1 !== newBlock.Index) {
        console.log("Invalid index")
        result = false
    }
    else if (previousBlock.Hash !== newBlock.PreviousHash) {
        console.log('invalid previoushash');
        result = false
    }
    else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log('Invalid hash');
        result = false
    }

    return result
};

let isValidChain = function (blockchainToValidate) {
    let isValidGenesis = function (block) {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
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

let addBlockToChain = function (newBlock) {
    let result = false
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
        result = true
    }

    return result
};

let replaceChain = function (newBlocks) {
    if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcastLatest();
    }
    else {
        console.log('Received blockchain invalid');
    }
};

module.exports = {
    Block,
    getBlockchain,
    getLatestBlock,
    generateNextBlock,
    isValidBlockStructure,
    replaceChain,
    addBlockToChain
};