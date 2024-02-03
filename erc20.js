// Importing the Alchemy SDK
const { Network, Alchemy, Wallet, Utils } = require("alchemy-sdk");

// Importing dotenv to read the API key from the .env file
const dotenv = require("dotenv");
dotenv.config();

// Reading the API key and private key from the .env file
const { API_KEY, PRIVATE_KEY } = process.env;

// Configuring the Alchemy SDK
const settings = {
  apiKey: API_KEY, // Replace with your API key.
  network: Network.ETH_SEPOLIA, // Replace with your network.
};

// Creating an instance of the Alchemy SDK
const alchemy = new Alchemy(settings);

async function erc20() {
  // Creating a wallet instance to send the transaction
  const wallet = new Wallet(PRIVATE_KEY, alchemy);

  // Replace with the address you want to send the tokens to
  const toAddress = "0xafaF84B9938b31B357DAdDe97e38772B63fcaE92";

  // USDC contract address on Sepolia testnet
  const usdcContractAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";

  // Using `getFeeData` method of Alchemy SDK to get the fee data (maxFeePerGas & maxPriorityFeePerGas) that will be used in the transaction object
  const feeData = await alchemy.core.getFeeData();

  // ABI for the transfer function of ERC20 token
  // Every ERC20 contract has this function and we are going to use it to transfer the tokens
  const abi = ["function transfer(address to, uint256 value)"];

  // Amount of tokens to send: Here we will send 2 USDC tokens
  const amountToSend = 2;

  // Decimals for USDC token: 6
  const decimals = 6;

  // Convert the amount to send to decimals (6 decimals for USDC)
  const amountToSendInDecimals = amountToSend * 10 ** decimals;

  // Create the data for the transaction -> data that tells the transaction what to do (which function of the contract to call, what parameters to pass etc.)
  // Create an interface object from the ABI to encode the data
  const iface = new Utils.Interface(abi);
  // Encoding the data -> Call transfer function and pass the amount to send and the address to send the tokens to
  const data = iface.encodeFunctionData("transfer", [
    toAddress,
    Utils.parseUnits(amountToSendInDecimals.toString(), "wei"),
  ]);

  // Make the transaction object to send the transaction
  const transaction = {
    to: usdcContractAddress, // The transaction will be sent to the USDC contract address
    nonce: await alchemy.core.getTransactionCount(wallet.getAddress()), // Get the nonce of the wallet
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas, // This is the fee that the miner will get
    maxFeePerGas: feeData.maxFeePerGas, // This is the maximum fee that you are willing to pay
    type: 2, // EIP-1559 transaction type
    chainId: 11155111, // Corresponds to ETH_SEPOLIA
    data: data, // encoded data for the transaction
    gasLimit: Utils.parseUnits("250000", "wei"), // gas limit for the transaction (250000 gas) -> For sending ERC20 tokens, the gas limit is usually around 200,000-250,000 gas
  };

  // Send the transaction and log it.
  const sentTx = await wallet.sendTransaction(transaction);
  console.log(sentTx);
}

erc20();