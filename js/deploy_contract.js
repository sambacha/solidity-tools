// https://github.com/ethereumjs/ethereumjs-tx#usage

var Tx = require('ethereumjs-tx');
require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3('${INFURA_API_KEY}');
const account1 = "${PUBLIC_ADDRESS}";
const privateKey1 = Buffer.from(process.env.PRIVATE_KEY, 'hex'); //convert to binary data

const contractData = '${CONTRACT_DATA}'
// get the transaction count for account 1
web3.eth.getTransactionCount(account1)
    .then(count => {
        //build the transaction with hex params
        const txParams = {
            nonce: web3.utils.toHex(count),
            data: contractData,
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
            gasLimit: web3.utils.toHex(4700000)
        };

        console.log('params: ', txParams);
        const tx = new Tx(txParams);

        //sign the transaction with the private key (binary data)
        tx.sign(privateKey1);

        // serialize the transaction
        const serializedTx = tx.serialize();

        // make a raw version
        const raw = '0x' + serializedTx.toString('hex');

        //broadcast the transaction
        web3.eth.sendSignedTransaction(raw)
            .then(result => {
                console.log("Tx hash: ", result);
            }).catch(error => console.log("Error 1: ", error));
        }
    ).catch(error => console.log("Error outer: ", error));;

