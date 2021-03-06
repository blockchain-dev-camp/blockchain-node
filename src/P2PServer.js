const WebSocket = require('ws');

const Block = require('./Models/Block');

let BC;
const P2PMessage = require('./Models/P2PMessage');
const Message = P2PMessage.Message;
const MessageType = P2PMessage.MessageType;

let sockets = [];

let getSockets = function () {
    return sockets;
}

let write = function (ws, message) {
    return ws.send(JSON.stringify(message));
}

let queryChainLengthMsg = function () {
    let message = new Message(MessageType.QUERY_LATEST, null);
    return message;
}

const queryAllMsg = function () {
    let message = new Message(MessageType.QUERY_ALL, null);
    return message;
};

let responseChainMsg = function () {
    let message = new Message(MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify(BC.getBlockchain()));
    return message;
}

let responseLatestMsg = function () {
    let message = new Message(MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify([BC.getLatestBlock()]));
    return message;
};

let broadcast = function (message) {
    return sockets.forEach(socket => write(socket, message));
}

let broadcastLatest = function () {
    broadcast(responseLatestMsg());
};

let init = function (port, bc) {
    BC = bc;

    let webSocket = require('ws')
    let server = new webSocket.Server({ port: port })

    server.on('connection', function (ws) {
        initConnection(ws)
    })

    console.log('P2P server started at port: ' + port);
}

function initConnection(ws) {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
}

function initMessageHandler(ws) {
    ws.on('message', function (data) {
        console.log('Received message: ' + data);
        let message = JSON.parse(data);        

        switch (parseInt(message.type)) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;

            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;

            case MessageType.RESPONSE_BLOCKCHAIN:
                let receivedBlocks = JSON.parse(message.data);
                if (receivedBlocks) {
                    handleBlockchainResponse(receivedBlocks);
                }
                else {
                    console.log('Invalid recieved blocks: ' + JSON.stringify(message.data))
                }
                    
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
    if (!BC.isValidBlockStructure(latestBlockReceived)) {
        console.log('block structuture not valid');
        return;
    }

    let latestBlockHeld = BC.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {

        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);

        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            if (BC.addBlockToChain(latestBlockReceived)) {
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
        return false;
    });
};

module.exports = { connectToPeers, broadcastLatest, init, getSockets };
