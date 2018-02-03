
const BC = require('./Blockchain')
const getBlockchain = BC.getBlockchain
const generateNextBlock = BC.generateNextBlock

const P2P = require('./P2PServer')
const getSockets = P2P.getSockets
const connectToPeers = P2P.connectToPeers


let init = function (port) {

    let bodyParser = require('body-parser')
    let app = require('express')()


    app.use(bodyParser.json())

    app.get('/blocks', function (req, res) {
        res.send(getBlockchain());
    });

    app.post('/mineBlock', function (req, res) {
        const newBlock = generateNextBlock(req.body.data);
        res.send(newBlock);
    });

    app.get('/peers', function (req, res) {
        res.send(getSockets().map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    app.post('/addPeer', function (req, res) {
        connectToPeers(req.body.peer);
        res.send();
    });

    app.listen(port, function () {
        console.log(`Server started at port ${port}`)
    });
}

module.exports = { init }