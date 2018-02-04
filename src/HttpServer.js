const Node = require('./Models/Node')
const BC = require('./Models/Blockchain')
const Block = require('./Models/Block')
const Transaction = require('./Models/Transaction')
//const getBlockchain = BC.getBlockchain
//const generateNextBlock = BC.generateNextBlock
let chain = new BC()
let localNode = new Node([],chain,1)

const P2P = require('./P2PServer')
const getSockets = P2P.getSockets
const connectToPeers = P2P.connectToPeers


let init = function (port) {

    let bodyParser = require('body-parser')
    let app = require('express')()


    app.use(bodyParser.json())

    app.get('/blocks', function (req, res) {
        res.send(chain.getBlockchain());
    });

    app.post('/mineBlock', function (req, res) {
        const newBlock = chain.generateNextBlock(req.body.data);
        res.send(newBlock);
    });
    app.post('/addBlock', function (req, res) {
        const newBlock = chain.generateNextBlock(req.body.data)
        chain.addBlock(newBlock)
        res.send(newBlock);
    });

    app.get('/peers', function (req, res) {
        res.send(getSockets().map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    app.post('/addPeer', function (req, res) {
        var connection = connectToPeers(req.body.peer);
        
        if (connection == false) {
            response = {
                "error": "true",
                "message": "Connection to this peer failed"
            }

            res.send(response);
        }
    });
    app.get('/transactions', function (req, res) {
        res.send(
            localNode.getTransactions()
        )
    });
    app.post('/transactions/new', function (req, res) {
        let transaction = new Transaction(
            req.body.fromAddress,
            req.body.toAddress,
            req.body.transactionValue,
            req.body.senderPubKey,
            req.body.senderSignature,
            new Date().getTime())
        if(transaction)
        localNode.addTransactions(transaction)
            res.send(
                {
                    "dateReceived": new Date(transaction.dateReceived),
                    "transactionHash": transaction.transactionHash
                }
            )
    });

    app.listen(port, function () {
        console.log(`Server started at port ${port}`)
    });
}

module.exports = { init }