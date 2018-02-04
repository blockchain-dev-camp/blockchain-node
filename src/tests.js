const ecdsa = require('elliptic')
const ec = new ecdsa.ec('secp256k1')
const RPMD160 = require('ripemd160')
// console.log(new RIPEMD160().update('42').digest('hex'))

function alabala() {

// Generate keys
    var key = ec.genKeyPair();

// Sign the message's hash (input must be an array, or a hex-string)
    var msgHash = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    var signature = key.sign(msgHash);

// Export DER encoded signature in Array
    var derSign = signature.toDER();

// Verify signature
    console.log(key.verify(msgHash, derSign));

// CHECK WITH NO PRIVATE KEY

    var pubPoint = key.getPublic();
    var x = pubPoint.getX();
    var y = pubPoint.getY();

// Public Key MUST be either:
// 1) '04' + hex string of x + hex string of y; or
// 2) object with two hex string properties (x and y); or
// 3) object with two buffer properties (x and y)
    var pub = pubPoint.encode('hex');                                 // case 1
    var pub = { x: x.toString('hex'), y: y.toString('hex') };         // case 2
    var pub = { x: x.toBuffer(), y: y.toBuffer() };                   // case 3
    var pub = { x: x.toArrayLike(Buffer), y: y.toArrayLike(Buffer) }; // case 3

// Import public key
    var key = ec.keyFromPublic(pub, 'hex');

// Signature MUST be either:
// 1) DER-encoded signature as hex-string; or
// 2) DER-encoded signature as buffer; or
// 3) object with two hex-string properties (r and s); or
// 4) object with two buffer properties (r and s)

    var signature = '3046022100...'; // case 1
    var signature = new Buffer('...'); // case 2
    var signature = { r: 'b1fc...', s: '9c42...' }; // case 3

// Verify signature
    console.log(key.verify(msgHash, signature));

}
function alabala2() {

// Generate keys
    let key = ec.genKeyPair()
    let private = key.getPrivate('hex')
    let k2 = ec.genKeyPair(private)
    let pubPoint = key.getPublic()
    let pubPoint2 = k2.getPublic()
    let pub = pubPoint.encode('hex')                                  // case 1
    let pub2 = pubPoint2.encode('hex')                                  // case 1
    let key2 = ec.keyFromPublic(pub, 'hex');
    //let pubPoint2 = key2.getPublic();
    //let pub2 = pubPoint.encode('hex');                                 // case 1

    let msgHash = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    let signature = key.sign(msgHash);
    console.log(key.verify(msgHash, signature));
    console.log(key2.verify(msgHash, signature));
    var derSign = signature.toDER();
    console.log(derSign);
    console.log(key2.verify(msgHash, derSign));

}

function alabala3() {
    const { randomBytes } = require('crypto')
    const secp256k1 = require('secp256k1')
// or require('secp256k1/elliptic')
//   if you want to use pure js implementation in node

// generate message to sign
    const msg = randomBytes(32)

// generate privKey
    let privKey,co,un
    do {
        privKey = randomBytes(32)
        co = secp256k1.privateKeyExport( privKey , true)
        un = secp256k1.privateKeyExport( privKey , false)

    } while (!secp256k1.privateKeyVerify(privKey))

    // let aaa = Buffer.from(bb2).toString('hex')

    //
    // var bytes = new Uint8Array(Math.ceil(aaa.length / 2));
    // for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(aaa.substr(i * 2, 2), 16);

    // console.log(bytes);
// get the public key in a compressed format
    const pubKey = secp256k1.publicKeyCreate(privKey)
    const pubKeyHex = Buffer.from(pubKey).toString('hex')
// sign the message
    const sigObj = secp256k1.sign(msg, privKey)

// verify the signature
    console.log(secp256k1.verify(msg, sigObj.signature, pubKey))
// => true
}

alabala3();