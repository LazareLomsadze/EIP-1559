require("dotenv").config();
const AlchemyWeb3 = require("@alch/alchemy-web3");

const { API_URL_HTTP_PROD_SEPOLIA, PRIVATE_KEY, ADDRESS } = process.env;
const toAddress = "0xa238b6008Bc2FBd9E386A5d4784511980cE504Cd"; 
const web3 = AlchemyWeb3.createAlchemyWeb3(API_URL_HTTP_PROD_SEPOLIA);

async function signTx(web3, fields = {}) {
  const nonce = await web3.eth.getTransactionCount(ADDRESS, 'latest');

  const transaction = {
   'nonce': nonce,
   ...fields,
  };

  return await web3.eth.accounts.signTransaction(transaction, PRIVATE_KEY);
}

async function sendTx(web3, fields = {}) {
  const signedTx = await signTx(web3, fields);

  web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
    if (!error) {
      console.log("Transaction sent!", hash);
      const interval = setInterval(function() {
        console.log("Attempting to get transaction receipt...");
        web3.eth.getTransactionReceipt(hash, function(err, rec) {
          if (rec) {
            console.log(rec);
            clearInterval(interval);
          }
        }); 
      }, 1000);
    } else {
      console.log("Something went wrong while submitting your transaction:", error);
    }
  });
}

function sendOnlyMaxPriorityFeePerGasLondonTx(web3) {
    web3.eth.estimateGas({
      to: toAddress,
      data: "0xc6888fa10000000000000000000000000000000000000000000000000000000000000003"
    }).then((estimatedGas) => {
      web3.eth.getMaxPriorityFeePerGas().then((price) => {
        sendTx(web3, {
          gas: estimatedGas,
          maxPriorityFeePerGas: price,
          to: toAddress,
          value: 1000000000000000,
        });
      });
    });
  }
  
  sendOnlyMaxPriorityFeePerGasLondonTx(web3);