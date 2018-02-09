const Node = require('./Models/Node')
const BC = require('./Models/Blockchain')
const P2P = require('./P2PServer')
const getSockets = P2P.getSockets
const connectToPeers = P2P.connectToPeers

let chain = new BC()
let localNode = new Node(chain, 3)

module.exports = () => {
    this.init = () => {
        const readline = require('readline');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('line', (input) => {
            var values = input.split(" ");

            if ( values[0] == "add_peer" ) {
                add_peer( values[1] );
            }

            if ( values[0] == "get_block" ) {
                get_block();
            }

            if ( values[0] == "get_balances" ) {
                get_balances();
            }

        });
    }

    return this;
}

function add_peer( peer ){
    var connection = connectToPeers(peer);

    if (connection == false) {
        console_message("Connection to this peer failed");
    }else{
        console_message("Peer " + peer + " added successfully.")
    }
}

function get_block() {
    console_message( localNode.blockChain.getBlockchain() );
}

function get_balances() {
    console_message( localNode.Balances );
}

function console_message( message ){
    console.log();
    console.log( message );
}