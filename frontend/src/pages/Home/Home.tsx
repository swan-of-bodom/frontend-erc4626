import React, { useState, useEffect } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  InjectedConnector,
  NoEthereumProviderError,
} from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import Modal from "../../components/Modal/Modal";

import MetamaskLogo from "../../assets/MetamaskLogo.png";
import WalletConnectLogo from "../../assets/WalletConnectLogo.png";
import "./Home.css";

const Home = () => {
  // Web3-react context provider
  const context = useWeb3React();

  const { library, chainId, account, activate, deactivate, active, error } =
    context;

  /**
   * @notice States
   */
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [ETHBalance, setETHBalance] = useState();

  /**
   * @notice Modal handlers
   */
  const openWalletModalHandler = () => setIsWalletModalOpen(true);
  const closeWalletModalHandler = () => setIsWalletModalOpen(false);

  // ------------ Wallets -------------

  /**
   * @notice Connect Metamask
   */
  const connectMetamask = () => {
    const injectedConnector = new InjectedConnector({});
    activate(injectedConnector);
  };

  /**
   * @notice Connect WalletConnect
   */
  const connectWalletConnect = () => {
    const RPC_URLS = {
      1: "https://mainnet.infura.io/v3/dd8c4f3d11b34b88bc14626e1fd02739",
      // 4: "https://rinkeby.infura.io/v3/407161c0da4c4f1b81f3cc87ca8310a7"
    };

    const walletConnectConnector = new WalletConnectConnector({
      rpc: RPC_URLS,
      bridge: "https://bridge.walletconnect.org",
      qrcode: true,
    });
    activate(walletConnectConnector);
  };

  // ------------ Non-Constant functions -------------

  
  /**
   * @notice Programmatically switch Metamask network
   */
  async function switchNetwork() {
    // Add chain to metamask if needed
    try {
      await library.provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x7A69",
            chainName: "Localhost",
            rpcUrls: ["http://localhost:8545"],
            blockExplorerUrls: ["http://localhost:8545"],
            nativeCurrency: {
              symbol: "ETH",
              decimals: 18,
            },
          },
        ],
      });
    } catch (err) {
      console.log(err);
    }

    // Switch to localhost
    await library.provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x7A69" }],
    });
  }


  // ------------ Constant functions -------------

  /**
   * @notice Format address to `0x1234...5678`
   */
  const formatAddress = (address: any) => {
    if (account) {
      return address.slice(0, 4) + "..." + address.slice(-4);
    }
  };

  // Escape modal
  document.addEventListener("keydown", (e: any) => {
    if (e.key === "Escape") {
      closeWalletModalHandler();
    }
  });

  return (
    <div className="page-home">
      <Modal
        isOpen={isWalletModalOpen}
        closeModalHandler={closeWalletModalHandler}
      >
        <div
          className="component-modal__modal__item"
          onClick={() => {
            connectMetamask();
            closeWalletModalHandler();
          }}
        >
          <img
            className="component-modal__modal__item__img"
            src={MetamaskLogo}
            alt="metamask"
          />
          <div className="component-modal__modal__item__text">Metamask</div>
        </div>
        <div
          className="component-modal__modal__item"
          onClick={() => {
            connectWalletConnect();
            closeWalletModalHandler();
          }}
        >
          <img
            className="component-modal__modal__item__img"
            src={WalletConnectLogo}
            alt="walletconnect"
          />
          <div className="component-modal__modal__item__text">
            WalletConnect
          </div>
        </div>
      </Modal>
      <header className="page-component__header">
        <div className="page-component__header__logo">
          <h2>Hyoga Vault Token</h2>
        </div>
        <div onClick={() => switchNetwork()}>
          {active
            ? chainId === 31337
              ? "Localhost"
              : "Wrong Network"
            : "Network"}
        </div>

        <div
          className="page-component__header__connect-btn"
          onClick={() => {
            if (active) {
              deactivate();
            } else {
              openWalletModalHandler();
            }
          }}
        >
          {active ? formatAddress(account) : "Connect Wallet"}
        </div>
      </header>
    </div>
  );
};

export default Home;
