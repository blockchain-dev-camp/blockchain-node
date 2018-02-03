const httpPort = parseInt(process.argv.slice(2)[0]) || 3000;
const p2pPort = parseInt(process.argv.slice(3)[0]) || 6000;

let httpServer = require('./HttpServer')
let p2pServer = require('./P2PServer')
let consoleReader = require('./ConsoleReader')()

httpServer.init(httpPort)
p2pServer.init(p2pPort)
consoleReader.init()