import { bootstrap } from "@chainsafe/dappeteer";
import { RECOMMENDED_METAMASK_VERSION } from "@chainsafe/dappeteer/dist/index";

import Config from "../config";
import createTransactionData from "../src/create_test_data/createTestDataManage";

export const MetaMaskOptions = {
  metaMaskVersion: RECOMMENDED_METAMASK_VERSION,
  automation: "puppeteer",
  headless: process.env.HEADLESS ? true : false,
  metaMaskFlask: false,
  args: [
    process.env.WSL ? "-no-sandbox" : "",
  ]
};
export default async function setup() {
  const { metaMask, browser } = await bootstrap(MetaMaskOptions);
  try {
    await createTransactionData.resetTestTmpFiles();
    await createTransactionData.createTransactionData(); // create test data
    global.browser = browser;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  }
  
  process.env.PUPPETEER_WS_ENDPOINT = browser.wsEndpoint();
  global.browser = browser;
  global.metamask = metaMask;
  
  const hostPage = await browser.newPage();
  await Config.getIns().initialize();
  await hostPage.goto(Config.getIns().httpServer);
  const configParams = {
    networkName: Config.getIns().axonRpc.netWorkName,
    rpc: Config.getIns().axonRpc.url,
    // chainId: 2022,
    chainId: "0x" + Config.getIns().axonRpc.chainId.toString(16),
    symbol: "AXON"
  }
  console.log("111111111111111111111");
  console.log(configParams);
  // add custom network to a MetaMask
  try {
    await hostPage.evaluate((cfparams) => {
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: cfparams.chainId,
            chainName: cfparams.networkName,
            nativeCurrency: {
              name: "Axon",
              symbol: "Axon", // 2-6 characters long
              decimals: 18,
            },
            rpcUrls: [cfparams.rpc],
          },
        ],
      });
    }, configParams);
    console.log("success");
  } catch (error) {
    console.log("addEthereumChain error")
    console.log(error);
    throw error;
  }
  
  console.log("111111111111111111111");
  await metaMask.acceptAddNetwork(false);
  console.log("111111111111111111111");
  await metaMask.switchNetwork("Axon");
  console.log("111111111111111111111");
  
  await hostPage.bringToFront();
  console.log("111111111111111111111");
  global.page = hostPage.page;
  console.log("111111111111111111111");
}
