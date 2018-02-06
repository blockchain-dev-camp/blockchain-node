const cryptoJs = require('crypto-js')
const ecdsa = require('elliptic')
const ec = new ecdsa.ec('secp256k1')
const RPMD160 = require('ripemd160')
const {randomBytes} = require('crypto')
const secp256k1 = require('secp256k1')

class Crypto {

    static convertUIntToHex(uint) {
        let hex = Buffer.from(uint).toString('hex')
        return hex
    }

    static converHexToUint(text) {
        let buffer = Buffer.from(text.toString(cryptoJs.enc.Hex), 'hex');
        let array = new Uint8Array(buffer);
        return array

        // let bytes = new Uint8Array(Math.ceil(text.length / 2));
        // for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(text.substr(i * 2, 2), 16);
        // return bytes
    }

    static calculateSHA256(...arg) {
        let stringToBeHashed = (arg.join(""))
        return cryptoJs.SHA256(stringToBeHashed).toString()
    }

    static generateKeys() {
        let privKey
        do {
            privKey = randomBytes(32)
        } while (!secp256k1.privateKeyVerify(privKey))
        let publicKey = secp256k1.publicKeyCreate(privKey, true)
        let pvHex = this.convertUIntToHex(privKey)
        let pbHex = this.convertUIntToHex(publicKey)
        return [pvHex, pbHex]
    }

    static hashAndBuffer(obj) {
        let hash = this.calculateSHA256(obj);
        return this.converHexToUint(hash)
    }

    static sign(message, privateKey) {
        let sign = secp256k1.sign(this.hashAndBuffer(message), this.converHexToUint(privateKey))
        let signDER = secp256k1.signatureExport(sign.signature)
        return signDER

    }

    static checkSign(message, signature, publicKey) {
        let sign = secp256k1.signatureImport(signature)
        let messageToCheck = this.hashAndBuffer(message)
        let keyAsArray = this.converHexToUint(publicKey)
        let result = secp256k1.verify(messageToCheck, sign, keyAsArray)
        return result
    }

    static getPublicKey(privateKey) {
        let publicKey = secp256k1.publicKeyCreate(this.converHexToUint(privateKey), true)
        return publicKey
    }

    static publiKeyToAddres(publicKey) {
        let addres = new RPMD160().update(publicKey).digest('hex')
        return addres
    }

    static publicKeyVerify(publicKey) {
        return secp256k1.publicKeyVerify(publicKey)
    }
}

module.exports = Crypto