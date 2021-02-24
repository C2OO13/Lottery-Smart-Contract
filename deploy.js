const Web3 = require('web3');
const {abi, bytecode} = require("./compile");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const dotenv = require('dotenv');
dotenv.config();
const mnemonicPhrase = process.env.MNEMONIC_PHRASE;

let provider = new HDWalletProvider({
    mnemonic: {
      phrase: mnemonicPhrase
    },
    providerOrUrl: process.env.INFURA_KOVAN_URL
});

const web3 = new Web3(provider);

const deploy = async ()=>{
    const accounts = await web3.eth.getAccounts();
    console.log("Account to used for deployment of contract: " + accounts[0]);
    const lottery = await new web3.eth.Contract(abi)
        .deploy({data: bytecode})
        .send({from: accounts[0]});
    console.log("Contract deployed at: " + lottery.options.address);
};
deploy();

provider.engine.stop();