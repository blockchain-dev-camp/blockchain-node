let init = function (port) {

    let bodyParser = require('body-parser')
    let app = require('express')()

    app.use(bodyParser.json())

    app.get('/', function (req, res) {
        res.send("home");
    });
    app.get('/info', function (req, res) {
        res.send("info")
    })
    app.get('/blocks', function (req, res) {
        res.send("block")
    })
    app.get('/blocks', function (req, res) {
        res.send("blocks");
    });
    app.get('/blocks/:index', function (req, res) {
        res.send("block");
    });
    app.get('/balance/:address/confirmations/:confirmCount', function (req, res) {
        res.send("balance");
    });
    app.post('/transactions/new', function (req, res) {
        res.send("transaction");
    });
    app.get('/transactions/:tranHash/info', function (req, res) {
        res.send("transaction info");
    });
    app.post('/blocks/notify', function (req, res) {
        res.send("block notify");
    });
    app.get('/peers', function (req, res) {
        res.send("peers");
    });

    app.listen(port, function () {
        console.log(`Server started at port ${port}`)
    });
}

module.exports = { init }