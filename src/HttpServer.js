const Node = require('./Models/Node')
const BC = require('./Models/Blockchain')
const Block = require('./Models/Block')
const Transaction = require('./Models/Transaction')
const Crypto = require('./Models/Crypto')

//const getBlockchain = BC.getBlockchain
//const generateNextBlock = BC.generateNextBlock
let chain = new BC()
let localNode = new Node(chain, 3)

const P2P = require('./P2PServer')
const getSockets = P2P.getSockets
const connectToPeers = P2P.connectToPeers


let init = function (port) {

    let bodyParser = require('body-parser')
    let app = require('express')()
    app.use(bodyParser.json())


    app.get('/blocks', function (req, res) {
        res.send(localNode.blockChain.getBlockchain());
    });

    app.get('/blocks/:index', (req, res) => {
        let index = req.params.index;
        res.send(localNode.blockChain.blocks[index]);
    });

    app.get('/balances', function (req, res) {
        res.send(localNode.balances);
    });

    app.post('/mineBlock', function (req, res) {
        let newBlock = localNode.blockChain.generateNextBlock(localNode);
        localNode.addBlockToChain(newBlock)
        //localNode.clearTransactions()

        res.send(newBlock);
    });
    app.get('/mineBlock/:address', function (req, res) {
        let address = req.params.address;
        let out = localNode.mineAddress(address)

        //Answer for easy testing
        let minerData = localNode.blockChain.mine(out.blockDataHash, out.difficulty)
        let mineAnswer = {
            nounce: minerData.nounce,
            dateCreated: minerData.nextTimestamp,
            blockHash: minerData.nextBlockHash
        }
        res.send([out, mineAnswer]);
    });

    app.post('/mining/submit-block/:address', (req, res) => {
        let address = req.params.address;
        let nounce = req.body.nounce;
        let dateCreated = req.body.dateCreated
        let blockHash = req.body.blockHash
        let result = localNode.checkMiningJob(address, nounce, dateCreated, blockHash)
        if (result) {
            let out = {
                nonce: nounce,
                dateCreated: new Date(dateCreated),
                blockHash: blockHash
            }
            let block = new Block(result.index, blockHash, result.prevBlockHash, dateCreated, result.difficulty, nounce, result.transactions, address)
            localNode.addBlockToChain(block)
            res.send([out, localNode.balances])
        }
    })


    app.post('/addBlock', function (req, res) {
        const newBlock = chain.generateNextBlock(req.body.data)
        localNode.addBlockToChain(newBlock)
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
    app.post('/transactions/sign', function (req, res) {
        let from = req.body.fromAddress
        let to = req.body.toAddress
        let value = req.body.value
        let privateKey = req.body.privateKey
        let tr = Transaction.signTransaction(from, to, value, privateKey, localNode.feePercent)
        res.send(
            tr
        )
    });
    app.get('/key', function (req, res) {
        res.send(
            Crypto.generateKeys()
        )
    });
    app.post('/transactions/new', function (req, res) {
        let transaction = new Transaction(
            req.body.fromAddress,
            req.body.toAddress,
            req.body.value,
            req.body.senderPubKey,
            req.body.senderSignature,
            req.body.dateOfSign,
            req.body.fee | 0)
        if (transaction)
            localNode.addTransactions(transaction)
        res.send(
            {
                "dateReceived": new Date(transaction.dateReceived),
                "transactionHash": transaction.transactionHash
            }
        )
    });
    app.get('/transaction/:transactionId/info', (req, res) => {
        let transactionId = req.params.transactionId;
        let transactions = localNode.getTransactions()
        let transaction = transactions.find(function (t) {
            return t.transactionId === transactionId
        })
        let trBlockNumber = localNode.allTransactions[transactionId]
        let transactionInBlockcahin
        if (trBlockNumber) {
            let block = this.blockChain.blocks[trBlockNumber]
            let tr = block.transactions.find(function (t) {
                return t.transactionId === transactionId
            })

        }


        res.send(
            {
                "transaction": transaction,
                "transactionInBlockChain": transactionInBlockcahin
            }
        )
    });
    app.get('/balance', (req, res) => {
        res.send(localNode.getBalance())
    })
    app.get('/info', (req, res) => {
        res.send(
            {
                "name": 'blockchain node'
            }
        )
    });

    app.listen(port, function () {
        console.log(`Http server started at port ${port}`)
    });
}

module.exports = {init}