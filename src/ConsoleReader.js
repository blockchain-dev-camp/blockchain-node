const P2P = require('./P2PServer')
const getSockets = P2P.getSockets
const connectToPeers = P2P.connectToPeers

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

        });
    }

    return this;
}

function add_peer( peer ){
    var connection = connectToPeers(peer);

    if (connection == false) {
        console.log("Connection to this peer failed");
    }
}