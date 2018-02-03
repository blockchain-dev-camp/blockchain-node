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

};

let isValidNewBlock = function (newBlock, previousBlock) {
    if (previousBlock.Index + 1 !== newBlock.Index) {
        
    }
};

let isValidChain = function (blockchainToValidate) {

};

let addBlockToChain = function (newBlock) {

};

let replaceChain = function (newBlocks) {

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