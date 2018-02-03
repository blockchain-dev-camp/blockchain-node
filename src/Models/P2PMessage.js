
let Message = (type, data) => {
    this.type
    this.data
    return this
}

let MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
}

module.exports = { Message, MessageType }

