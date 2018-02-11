const Node = require('./Models/Node');
const BC = require('./Models/Blockchain');
const Block = require('./Models/Block');
const Transaction = require('./Models/Transaction');
const Crypto = require('./Models/Crypto');

const P2P = require('./P2PServer');
const getSockets = P2P.getSockets;
const connectToPeers = P2P.connectToPeers;

let init = function (port, localNode) {

    let bodyParser = require('body-parser');
    let app = require('express')();
    app.use(bodyParser.json());

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
        let miningInfo = localNode.mineAddress(localNode.address)
        let minerData = localNode.blockChain.mine(miningInfo.blockDataHash, miningInfo.difficulty)
        let mineAnswer = {
            nounce: minerData.nounce,
            dateCreated: minerData.nextTimestamp,
            blockHash: minerData.nextBlockHash
        }
        let address = localNode.address;
        let nounce = minerData.nounce;
        let dateCreated = minerData.nextTimestamp
        let blockHash = minerData.nextBlockHash
        let result = localNode.checkMiningJob(address, nounce, dateCreated, blockHash)
        if (result) {
            let block = new Block(result.index, blockHash, result.prevBlockHash, dateCreated, result.difficulty, nounce, result.transactions, address)
            localNode.addBlockToChain(block)
            res.send([block, localNode.balances])
        }

        // let newBlock = localNode.blockChain.generateNextBlock(localNode);
        // localNode.addBlockToChain(newBlock)
        //localNode.clearTransactions()
        // res.send(newBlock);
    });

    app.get('/mineBlock/:address', function (req, res) {
        let address = req.params.address;
        let miningJob = localNode.mineAddress(address);
        if (!miningJob) {
            res.status(404).send('No mining job found.');
        } else {    
            //Answer for easy testing
            // let minerData = localNode.blockChain.mine(miningJob.blockDataHash, miningJob.difficulty)
            // let mineAnswer = {
            //     nounce: minerData.nounce,
            //     dateCreated: minerData.nextTimestamp,
            //     blockHash: minerData.nextBlockHash
            // }        

            // res.send([miningJob, mineAnswer]);

            res.send([miningJob]);
        }
    });

    app.post('/mining/submit-block/:address', (req, res) => {
        let address = req.params.address;
        let nounce = req.body.nounce;
        let dateCreated = req.body.dateCreated;
        let blockHash = req.body.blockHash;
        let result = localNode.checkMiningJob(address, nounce, dateCreated, blockHash);
        if (!result) {
            res.status(404).send('No Job for this address.');
        } else {
            let out = {
                nonce: nounce,
                dateCreated: new Date(dateCreated),
                blockHash: blockHash
            };

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
            let block = localNode.blockChain.blocks[trBlockNumber]
            let tr = block.transactions.find(function (t) {
                return t.transactionId === transactionId
            })
            transactionInBlockcahin = tr;
        }

        res.send(
            {
                "transaction": transaction || transactionInBlockcahin
            }
        )
    });

    app.get('/balance/:address', (req, res) => {
        let balances = localNode.getBalances();
        let address = req.params.address;
        if (address in balances) {
            res.send(balances[address].toString());
        } else {
            res.status(404).send();
        }       
    })

    app.get('/balance', (req, res) => {
        res.send(localNode.getBalances());
    });    

    app.get('/info', (req, res) => {
        let out = {
            about: "SoftUniChain/0.0009-nodeJs",
            nodeName: localNode.address,
            confirmedTransactions: Object.keys(localNode.allTransactions).length,
            peers: localNode.Peers.length,
            blocks: localNode.blockChain.blocks.length,
            pendingTransactions: localNode.PendingTransactions.length,
            addresses: localNode.address,
            coins: localNode.balances[localNode.godAddress]
        };
        
        res.send(out);
    });

    app.listen(port, function () {
        console.log(`Http server started at port ${port}`);
    });
}

module.exports = {init}
