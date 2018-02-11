const httpPort = parseInt(process.argv.slice(2)[0]) || 5555;
const p2pPort = parseInt(process.argv.slice(3)[0]) || 6000;
const initialPeers = process.argv.slice(4)[0] ? process.argv.slice(4)[0].split(',') : [];

const Node = require('./Models/Node');
const BC = require('./Models/Blockchain');

let chain = new BC();
let localNode = new Node(chain, 3);

let httpServer = require('./HttpServer');
let p2pServer = require('./P2PServer');
let consoleReader = require('./ConsoleReader')();

httpServer.init(httpPort, localNode);
p2pServer.init(p2pPort, chain);
initialPeers.forEach(peer => p2pServer.connectToPeers(peer));
consoleReader.init(localNode);
