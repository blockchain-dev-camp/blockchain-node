const cryptoJs = require('crypto-js')

const broadcastLatest = require('./P2PServer').broadcastLatest
const Block = require('./Models/Block')


let genesisBlock = Block(0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [], 0, 0)

let blockchain = [genesisBlock]

let unspentTxOuts = []

let getBlockchain = function () {
    return blockchain
}

let getLatestBlock = function () {
    return blockchain[blockchain.length - 1]
}

// in seconds
const BLOCK_GENERATION_INTERVAL = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

let getDifficulty = function (aBlockchain/*Block[]*/) {
    let latestBlock = aBlockchain[blockchain.length - 1];

    if (latestBlock.Index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.Index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    }
    else {
        return latestBlock.difficulty;
    }
};

let getAdjustedDifficulty = function(latestBlock, aBlockchain/*Block[]*/) {
    let prevAdjustmentBlock = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    let timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    let timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;

    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    }
    else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    }
    else {
        return prevAdjustmentBlock.difficulty;
    }
};

let generateNextBlock = function (blockData) {
    let previousBlock = getLatestBlock();
    let nextIndex = previousBlock.Index + 1;
    let nextTimestamp = new Date().getTime() / 1000;
    let nextHash = calculateHash(nextIndex, previousBlock.Hash, nextTimestamp, blockData);
    let newBlock = Block(nextIndex, nextHash, previousBlock.Hash, nextTimestamp, blockData);
    return newBlock;
};

let findBlock = function (index, previousHash, timestamp, data, difficulty) {
    let nonce = 0;
    while (true) {
        let hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);

        if (hashMatchesDifficulty(hash, difficulty)) {
            return Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce += 1;
    }
};

let calculateHashForBlock = function (block) {
    return calculateHash(block.Index, block.PreviousHash, block.Timestamp, block.Data).toString();
}

let calculateHash = function (index, previousHash, timestamp, data, difficulty, nonce) {
    return cryptoJs.SHA256(index + previousHash + timestamp + data + difficulty + nonce)
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

let isValidTimestamp = function (newBlock, previousBlock) {
    return (previousBlock.Timestamp - 60 < newBlock.Timestamp) && newBlock.Timestamp - 60 < getCurrentTimestamp();
};

let getCurrentTimestamp = function () {
    return Math.round(new Date().getTime() / 1000);
}

let hashMatchesDifficulty = function (hash, difficulty) {
    let hashInBinary = hexToBinary(hash);
    let requiredPrefix = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
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