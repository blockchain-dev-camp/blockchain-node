
const httpPort = parseInt(process.env.HTTP_PORT) || 3000;
const p2pPort = parseInt(process.env.P2P_PORT) || 6000;

let httpServer = require('./HttpServer')()
let p2pServer = require('./P2PServer')()

httpServer.init(httpPort)
p2pServer.init(p2pPort)