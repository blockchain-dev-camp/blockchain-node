module.exports = () => {
    let bodyParser = require('body-parser')
    let app = require('express')()
    app.use(bodyParser.json())

    this.init = (port) => {
        app.get('/', (req, res) => {
            res.send("home");
        });

        app.get('/info', (req, res) => {
<<<<<<< HEAD
            res.send("info")
        })
        app.get('/blocks', (req, res) => {
        })
=======
            res.send("info");
        });

        app.get('/blocks', (req,res) => {
            res.send("blocks");
        });

>>>>>>> 593246c0b0c4284ba3f517f3602d0783c15d1fff
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
<<<<<<< HEAD
        })
=======
            res.send("peers");
        });
>>>>>>> 593246c0b0c4284ba3f517f3602d0783c15d1fff

        app.listen(port, () => console.log(`Server started at port ${port}`));
    }

    return this;
}