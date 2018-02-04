const Block = require('./Models/Block')

const BC = require('./Models/Blockchain')
const addBlockToChain = BC.addBlockToChain
const getBlockchain = BC.getBlockchain
const getLatestBlock = BC.getLatestBlock
const isValidBlockStructure = BC.isValidBlockStructure
const replaceChain = BC.replaceChain

const P2PMessage = require('./Models/P2PMessage')
const Message = P2PMessage.Message
const MessageType = P2PMessage.MessageType


let sockets = []

let getSockets = function () {
    return sockets
}

let write = function (ws, message) {
    return ws.send(JSON.stringify(message));
}

let queryChainLengthMsg = function () {
    let message = Message(MessageType.QUERY_LATEST, null)
    return message
}
const queryAllMsg = function () {
    let message = Message(MessageType.QUERY_ALL, null)
    return message
};

let responseChainMsg = function () {
    let message = Message(MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify(getBlockchain()))
    return message
}

let responseLatestMsg = function () {
    let message = Message(MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify([getLatestBlock()]))
    return message
};

let broadcast = function (message) {
    return sockets.forEach(socket => write(socket, message));
}

let broadcastLatest = function () {
    broadcast(responseLatestMsg());
};


let init = function (port) {
    let webSocket = require("ws")
    let server = new webSocket.Server({ port: port })

    server.on("connection", function (ws) {
        initConnection(ws)
    })
    console.log("listening websocket p2p port on: " + port);
}

function initConnection(ws) {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
}

function initMessageHandler(ws) {
    ws.on('message', function (data) {
        let message = validateMessage(data)
        if (message === null) {
            console.log('Invalid recieved message: ' + data)
            return
        }

        console.log('Received message: ' + JSON.stringify(message));
        switch (parseInt(message.type)) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;

            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;

            case MessageType.RESPONSE_BLOCKCHAIN:
                const receivedBlocks = validateMessageData(message.data);
                if (receivedBlocks === null) {
                    console.log('invalid blocks received:');
                    console.log(message.data)
                    break;
                }
                handleBlockchainResponse(receivedBlocks);
                break;
        }
    });
}

let initErrorHandler = function (ws) {
    let closeConnection = function (wsToClose) {
        console.log('connection failed to peer: ' + wsToClose.url);
        sockets.splice(sockets.indexOf(wsToClose), 1);
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


let connectToPeers = function (newPeer) {
    let ws = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};

module.exports = { connectToPeers, broadcastLatest, init, getSockets };



function validateMessage(msg) {
    if (!isNaN(msg.type)) {
        return Message(msg.type, msg.data)
    }
    else {
        return null
    }
}

function validateMessageData(data) {
    // TODO
}