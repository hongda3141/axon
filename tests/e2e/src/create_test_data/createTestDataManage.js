import Web3 from "web3";
import fs from "fs";
import Config from "../../config";
import erc20 from "./ERC20.json";

const basePath = "./src/test_data_temp_file";
const option = { timeout: 1000 * 30 };
const web3 = new Web3(
  new Web3.providers.HttpProvider(Config.getIns().axonRpc.url, option)
);
const accountFrom = web3.eth.accounts.privateKeyToAccount(
  Config.getIns().hexPrivateKey
);
const transactionInfo = {
  contractAddress: "",
  transactionHash: "",
  blockNumber: "",
  hexBlockNumber: "",
  blockHash: "",
  transactionIndex: "",
  accountAddress: "",
  topic1: "",
  topic2: "",
};
const filterIds = {
  filter_id_1: "",
  filter_id_2: "",
  filter_id_3: "",
};
const createTestDataMange = {
  async savejson(filePath, data) {
    const dataStr = JSON.stringify(data, null, 4);
    if (dataStr) {
      try {
        fs.writeFileSync(filePath, dataStr);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(`save error ${err}`);
        throw err;
      }
    }
  },
  async sendTransaction(account, data) {
    const nonce = await web3.eth.getTransactionCount(accountFrom.address);
    const tx = {
      type: 2,
      nonce,
      maxPriorityFeePerGas: 2500,
      maxFeePerGas: 2500,
      gasLimit: 2100000,
      chainId: Config.getIns().axonRpc.chainId,
      data,
    };
    const transaction = await accountFrom.signTransaction(tx);
    return web3.eth.sendSignedTransaction(transaction.rawTransaction);
  },
  async createTransactionData() {
    const contract = new web3.eth.Contract(erc20.abi);
    const txOptions = { data: erc20.bytecode, arguments: ["TT", "TTT"] };
    const data = contract.deploy(txOptions).encodeABI();
    const receipt = await this.sendTransaction(accountFrom.address, data);
    transactionInfo.contractAddress = receipt.contractAddress;
    transactionInfo.transactionHash = receipt.transactionHash;
    transactionInfo.blockHash = receipt.blockHash;
    transactionInfo.blockNumber = receipt.blockNumber;
    transactionInfo.transactionIndex = receipt.transactionIndex;
    transactionInfo.accountAddress = accountFrom.address;
    transactionInfo.hexBlockNumber = `0x${receipt.blockNumber.toString(16)}`;
    transactionInfo.topic1 =
      "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0";
    transactionInfo.topic2 =
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    await this.savejson(`${basePath}/testData_1.json`, transactionInfo);
  },
  async writeFilterIds(filterIdIndex, id) {
    const filePath = `${basePath}/filterIds.json`;
    try {
      const jsonData = await fs.readFileSync(filePath, "binary").toString();
      const data = JSON.parse(jsonData);
      filterIds.filter_id_1 = data.filter_id_1;
      filterIds.filter_id_2 = data.filter_id_2;
      filterIds.filter_id_3 = data.filter_id_3;
    } catch (err) {
      await this.savejson(filePath, filterIds);
    }
    if (filterIdIndex === 1) {
      filterIds.filter_id_1 = id;
    }
    if (filterIdIndex === 2) {
      filterIds.filter_id_2 = id;
    }
    if (filterIdIndex === 3) {
      filterIds.filter_id_3 = id;
    }
  },
  readTestDataAsJson(testFileName) {
    let data;
    try {
      const filePath = `${basePath}/${testFileName}`;
      const jsonData = fs.readFileSync(filePath, "binary").toString();
      data = JSON.parse(jsonData);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      throw err;
    }
    return data;
  },
  async resetTestTmpFiles() {
    try {
      fs.rmSync(`${basePath}/`, { recursive: true, force: true });
      // fs.rmdir(`${basePath}/`, { recursive: true });
      fs.mkdirSync(`${basePath}/`);
    } catch (ex) {
      fs.mkdirSync(`${basePath}/`);
    }
  },
  async sendRawTestTx() {
    const toAddress = Config.getIns().acount2;
    const nonce = (await web3.eth.getTransactionCount(accountFrom.address)) + 1;
    const txObject = {
      nonce: nonce.toString(),
      gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
      gasLimit: web3.utils.toHex(21000),
      to: toAddress,
      value: web3.utils.toHex(web3.utils.toWei("1", "ether")),
    };
    // eslint-disable-next-line global-require
    // const EthereumTx = require("ethereumjs-tx").Transaction;
    const EthereumTx = require('@ethereumjs/tx').Transaction;
    const tx = new EthereumTx(txObject.toString("hex"));
    const privateKey = Buffer.from(Config.getIns().hexPrivateKey.substring(2), 'hex');
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    return serializedTx.toString("hex");
  },
  async sendNonEip155RawTestTx() {
    const toAddress = Config.getIns().acount2;
    const nonce = (await web3.eth.getTransactionCount(accountFrom.address)) + 1;
    const txObject = {
      nonce: nonce.toString(),
      gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
      gasLimit: web3.utils.toHex(21000),
      to: toAddress,
      value: web3.utils.toHex(web3.utils.toWei("1", "ether")),
      // chain: "mainnet", 
      // hardfork: "homestead",
    };
    // eslint-disable-next-line global-require    // "@ethereumjs/tx": "^2.0.0",
    // import Common, { Chain, Hardfork } from '@ethereumjs/common'
// import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx'
    // const Common = require('@ethereumjs/common').default;
    const  { Chain, Common, Hardfork }  = require('@ethereumjs/common');
    // const Common  = require('@ethereumjs/common');
    const Transaction = require('@ethereumjs/tx').Transaction;
    // const test = Common.
    // const EthereumTx = require("ethereumjs-tx").Transaction;
    // const tx = Transaction.fromTxData(txObject.toString("hex"), { common: new Common({ chain: "mainnet", hardfork: "homestead" }) });
    // const tx = new EthereumTx(txObject.toString("hex"), { chain: "mainnet", hardfork: "homestead" });
    // const tx = Transaction.fromTxData(txObject.toString("hex"), { chain: "mainnet", hardfork: "homestead" });
    // const tx = Transaction.fromTxData(txObject.toString("hex"), { common: new Common({ chain: "mainnet", hardfork: "homestead" }) });
    // const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.TangerineWhistle, eips: [4844] })
    const common = new Common({chain: Chain.Mainnet, hardfork: Hardfork.TangerineWhistle});
    // const common = new Common.Common({ common: {hardfork: Hardfork.TangerineWhistle}});
    const tx = Transaction.fromTxData(txObject.toString("hex"),{common});
    // const tx = Transaction.fromTxData(txParams, { common: new Common({ chain: txParams.chain, hardfork: txParams.hardfork }) });
    // const tx = new EthereumTx(txObject.toString("hex"), {
    //   chain: 'mainnet',// ropsten
    //   hardfork: 'Spurious Dragon', spuriousDragon
    //   // hardfork: 'homestead',  byzantium frontierThawing tangerineWhistle
    // });
    console.log(tx);
    const privateKey = Buffer.from(Config.getIns().hexPrivateKey.substring(2), 'hex');
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    console.log(serializedTx);
    console.log(serializedTx.toString("hex"));
    return serializedTx.toString("hex");
  },
};
export default createTestDataMange;
