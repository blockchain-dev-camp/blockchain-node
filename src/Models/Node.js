module.exports = (peers, blocks, pendingTransactions, balances, difficulty, miningJobs) => {
    this.Peers = peers // URL[]
    this.Blocks = blocks // Block[]
    this.PendingTransactions = pendingTransactions // Transaction[]
    this.Balances = balances // map(address => number)
    this.Difficulty = difficulty // number
    this.MiningJobs = miningJobs // map(address => Block)
    
    return this;
}

