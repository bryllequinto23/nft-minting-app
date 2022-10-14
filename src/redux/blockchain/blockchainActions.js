// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Web3Modal from "web3modal"
// log
import { fetchData } from "../data/dataActions";
import axios from "axios";
import { providers } from "@web3modal/ethereum";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "Hello Charlie", // Required
      infuraId: "2d75ec6e41fc447682a245241185d5ea", // Required
      chainId: 5, // Optional. It defaults to 1 if not provided
      darkMode: false // Optional. Use dark theme, defaults to false
    }
  }
};

const web3Modal = new Web3Modal({
  network: "georli", // optional
  cacheProvider: false, // optional
  theme: "dark",
  providerOptions // required
});

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();

    let wl;
    let og;
    let wa;

    await axios.get('./api/getList.php')
        .then(res => {
          wl = res.data.WL;
          og = res.data.OG;
          wa = res.data.WA;
        }).catch((error) => {
          alert(error)
        })

    try {
      let provider = await web3Modal.connect();
      let web3 = new Web3(provider);
  
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
  
      if (networkId == CONFIG.NETWORK.ID) {
        const SmartContractObj = new web3.eth.Contract(
          abi,
          CONFIG.CONTRACT_ADDRESS
        );

        const saleState = await SmartContractObj.methods.currState().call(); // get sale state

        dispatch(
          connectSuccess({
            account: accounts[0],
            smartContract: SmartContractObj,
            web3: web3,
            saleState: +(saleState),
            wl: wl,
            og: og,
            wa: wa
          })
        );
        // Add listeners start
        provider.on("accountsChanged", (accounts) => {
          dispatch(updateAccount(accounts[0]));
        });
        provider.on("chainChanged", () => {
          window.location.reload();
        });
        // Add listeners end
      } else {
        dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
      }
    } catch(e) {
      console.log(e)
      dispatch(connectFailed("Something went wrong."));
    }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};