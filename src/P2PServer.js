const Block = require('./Models/Block')
const BC = require('./Blockchain')

const addBlockToChain = BC.addBlockToChain
const getBlockchain = BC.getBlockchain
const getLatestBlock = BC.getLatestBlock
const isValidBlockStructure = BC.isValidBlockStructure
const replaceChain = BC.replaceChain


module.exports = function () {
    let webSocket = require("ws")

    this.init = (port) => {
        let server = new webSocket.Server({ port: port })
        server.on("connection", (ws) => {

        })
        console.log("listening websocket p2p port on: " + p2pPort);

    }

    return this
}

let sockets = []

function initConnection(ws) {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
}

let write = function (ws, message) {
    return ws.send(JSON.stringify(message));
}

let broadcast = function (message) {
    return sockets.forEach((socket) => write(socket, message));
}

let queryChainLengthMsg = function () {
    return { 'type': MessageType.QUERY_LATEST, 'data': null };
}
const queryAllMsg = function () {
    return { 'type': MessageType.QUERY_ALL, 'data': null }
};

let responseChainMsg = function () {
    return { 'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(getBlockchain()) };
}

let responseLatestMsg = function () {
    return { 'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify([getLatestBlock()]) }
};

let initErrorHandler = function (ws) {
    let closeConnection = function (myWs) {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

let handleBlockchainResponse = function (receivedBlocks) {
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }

    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    if (!isValidBlockStructure(latestBlockReceived)) {
        console.log('block structuture not valid');
        return;
    }

    let latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            if (addBlockToChain(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        }
        else if (receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        }
        else {
            console.log('Received blockchain is longer than current blockchain');
            replaceChain(receivedBlocks);
        }
    }
    else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};

let broadcastLatest = function () {
    broadcast(responseLatestMsg());
};

let connectToPeers = function (newPeer) {
    let ws = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};

module.exports = { connectToPeers, broadcastLatest, initP2PServer, getSockets };