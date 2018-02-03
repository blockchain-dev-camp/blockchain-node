const broadcastLatest = require('./P2PServer').broadcastLatest
const crypto = require('crypto-js')


let genesisBlock = new Block(0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [], 0, 0);

let blockchain = [genesisBlock];

let getBlockchain = function () {
    return blockchain;
}

let getLatestBlock = function () {
    return blockchain[blockchain.length - 1];
}

let generateNextBlock = function (blockData) {
    const previousBlock = getLatestBlock();
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime() / 1000;
    const nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    const newBlock = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    addBlock(newBlock);
    broadcastLatest();
    return newBlock;
};

let calculateHashForBlock = function (block) {

}

let calculateHash = function (index, previousHash, timestamp, data, difficulty, nonce) {

}

let addBlock = function (newBlock) {
    const addBlock = function (newBlock) {
        if (isValidNewBlock(newBlock, getLatestBlock())) {
            blockchain.push(newBlock);
        }
    };
}

let isValidBlockStructure = function (block) {

};

let isValidNewBlock = function (newBlock, previousBlock) {

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