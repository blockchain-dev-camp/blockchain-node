module.exports = (index, hash, previousHash, timestamp, data, difficulty, nonce) => {
    this.Index = index
    this.Hash = hash
    this.PreviousHash = previousHash
    this.Timestamp = timestamp
    this.Data = data
    this.Difficulty = difficulty
    this.Nonce = nonce
    
    return this
}