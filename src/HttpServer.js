const Node = require('./Models/Node')
const BC = require('./Models/Blockchain')
const Block = require('./Models/Block')
const Transaction = require('./Models/Transaction')
const crypto = require('./Models/Crypto')

//const getBlockchain = BC.getBlockchain
//const generateNextBlock = BC.generateNextBlock
let chain = new BC()
let localNode = new Node([], chain, 1)

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
        let connection = connectToPeers(req.body.peer);

        if (connection == false) {
            response = {
                "error": "true",
                "message": "Connection to this peer failed"
            }
            res.send(response);
        }
        else {
            res.send();
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
            req.body.value,
            req.body.senderPubKey,
            req.body.senderSignature,
            req.body.dateOfSign)
        if (transaction)
            localNode.addTransactions(transaction)
        res.send(
            {
                "dateReceived": new Date(transaction.dateReceived),
                "transactionHash": transaction.transactionHash
            }
        )
    });
    app.get('/key', function (req, res) {
        res.send(
            crypto.generateKeys()
        )
    });
    app.post('/tansactionSign', function (req, res) {

        let from = req.body.fromAddress
        let to = req.body.toAddress
        let value = req.body.value
        let privateKey = req.body.privateKey
        let tr = Transaction.GenerateSignedTransaction(from, to, value, privateKey)
        res.send(
            tr
        )
    })
    app.post('/trsgn', function (req, res) {
        let from = "20f4309c6ff9164a95071b3489962200140d356a"
        let to = "a369d21d62fa3f03845ace5c9beaba29820c0789"
        let value = 324
        let privateKey = "208b21e2ef3a51076029d4e5e34c1749447b82993adfcb5f077d9e7bf29ab7b8"
        let tr = Transaction.GenerateSignedTransaction(from, to, value, privateKey)
        res.send(
            tr
        )
    });
    app.listen(port, function () {
        console.log(`Server started at port ${port}`)
    });
}

module.exports = { init }