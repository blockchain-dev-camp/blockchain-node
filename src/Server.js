module.exports = () => {
    this.init = (port = 3333) => {
        let bodyParser = require('body-parser')
        let app = require('express')()
        app.use(bodyParser.json())

        app.get('/', (req, res) => {
            res.send("home")
        })
        app.get('/info', (req, res) => {
            res.send("info")
        })
        app.get('/blocks', (req,res) => {
        })
        app.get('/blocks/:index', (req, res) => {
        })
        app.get('/balance/:address/confirmations/:confirmCount', (req, res) => {
        })
        app.post('/transactions/new', (req, res) => {
        })
        app.get('/transactions/:tranHash/info', (req, res) => {
        })
        app.post('/blocks/notify', (req, res) => {
        })
        app.get('/peers', (req, res) => {
        })
        app.post('/peers', (req, res) => {
        })

        app.listen(port, () => console.log(`Server started at port ${port}`))
    }

    return this
}