module.exports = () => {
    this.init = () => {
        const readline = require('readline');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('line', (input) => {
            var values = input.split(" ");

            console.log("You run '" + values[0] + "' command");
        });
    }

    return this;
}