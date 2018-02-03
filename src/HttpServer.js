let init = function (port) {
    
    let bodyParser = require('body-parser')
    let app = require('express')()


    app.use(bodyParser.json())

    app.get('/', (req, res) => {
        res.send("home");
    });

    app.get('/info', (req, res) => {
        res.send("info")
    })

    app.get('/blocks', (req, res) => {
        res.send("block")
    })

    app.get('/blocks', (req, res) => {
        res.send("blocks");
    });

    app.get('/blocks/:index', (req, res) => {
        res.send("block");
    });

    app.get('/balance/:address/confirmations/:confirmCount', (req, res) => {
        res.send("balance");
    });

    app.post('/transactions/new', (req, res) => {
        res.send("transaction");
    });

    app.get('/transactions/:tranHash/info', (req, res) => {
        res.send("transaction info");
    });

    app.post('/blocks/notify', (req, res) => {
        res.send("block notify");
    });

    app.get('/peers', (req, res) => {
        res.send("peers");
    });

    app.listen(port, () => console.log(`Server started at port ${port}`));
}

module.exports = { init }