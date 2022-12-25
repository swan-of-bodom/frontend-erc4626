// React
import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { toast } from "react-toastify";

// Web3React
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
// import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

// Ethers
import { ethers, BigNumber } from "ethers";

// Components
import Modal from "../../components/Modal/Modal";

// CSS
import "./Home.css";

// Assets
import MetamaskLogo from "../../assets/MetamaskLogo.png";
import WalletConnectLogo from "../../assets/WalletConnectLogo.png";

// ABIS
import ERC20Abi from "../../abis/MyVaultTokenERC20.json";
import ERC4626Abi from "../../abis/MyVaultTokenERC4626.json";

// Addresses
const MY_VAULT_TOKEN_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const ERC4626_VAULT_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

const Home = () => {
  // web3-react -----------

  // Context.Provider
  const context = useWeb3React();

  // Web3 context
  const { library, chainId, account, activate, deactivate, active } = context;

  // ------------ Refs -------------

  /** @notice Deposit/Withdrawal amount input */
  const amountRef = useRef<HTMLInputElement>(null);

  /** @notice Deposit/Withdrawal address input */
  const receiverRef = useRef<HTMLInputElement>(null);

  // ------------ States -------------

  /** @notice Opens connect button modal */
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  /** @notice Switches between deposit and redeem modal */
  const [deposit, setDeposit] = useState<boolean>(true);

  // Deposit

  /** @notice Sets asset deposit amount */
  const [depositAmount, setDepositAmount] = useState<BigNumber>(ethers.utils.parseUnits("0"));

  /** @notice Sets the receiver address for deposits/withdrawals */
  const [actionReceiver, setActionReceiver] = useState<string>("");

  // Withdrawal

  /** @notice Sets shares amount to redeem */
  const [sharesAmount, setSharesAmount] = useState<BigNumber>(ethers.utils.parseUnits("0"));

  /** @notice Total Assets held by the vault contract */
  const [totalAssets, setTotalAssets] = useState<string>("");

  /** @notice Owner of the shares we are redeeming */
  const [sharesOwner, setSharesOwner] = useState<string>("");

  // Allowance

  /** @notice Allowance of vault in ERC20 */
  const [vaultAllowance, setVaultAllowance] = useState<BigNumber>();

  // User Info

  /** @notice ETH balance of signer */
  const [ETHBalance, setETHBalance] = useState<string>();

  /** @notice Asset balance of signer */
  const [assetBalance, setAssetBalance] = useState<string>();

  /** @notice Share balance of signer */
  const [sharesBalance, setSharesBalance] = useState<string>();

  // Vault info

  /** @notice Total Shares minted by the vault contract */
  const [totalShares, setTotalShares] = useState<string>("");

  // ------------ Handlers -------------

  /** @notice Opens connect button modal */
  const openWalletModalHandler = () => setIsWalletModalOpen(true);

  /** @notice Closes connect button modal */
  const closeWalletModalHandler = () => setIsWalletModalOpen(false);

  // ------------ Wallets -------------

  /** @notice Connect Metamask */
  const connectMetamask = () => {
    const injectedConnector = new InjectedConnector({});
    activate(injectedConnector);
  };

  /** @notice Connect WalletConnect - Will not work on Localhost */
  const connectWalletConnect = () => {
    // const RPC_URLS = {
    //   1: "https://mainnet.infura.io/v3/dd8c4f3d11b34b88bc14626e1fd02739",
    // };
    // const walletConnectConnector = new WalletConnectConnector({
    //   rpc: RPC_URLS,
    //   bridge: "https://bridge.walletconnect.org",
    //   qrcode: true,
    // });
    // activate(walletConnectConnector);
  };

  // ------------ Constant functions -------------

  /** @notice Format address to `0x1234...5678` */
  const formatAddress = (address: string | null | undefined) => {
    if (account) {
      return address?.slice(0, 4) + "..." + address?.slice(-4);
    }
  };

  /** @notice Format address to `0x1234...5678` */
  const formatContractAddress = (address: string | null | undefined) => {
    return address?.slice(0, 4) + "..." + address?.slice(-4);
  };

  /** @notice remove the annoying scroll of numbers when press keypad */
  const removeScroll = (e: KeyboardEvent) => {
    if (["Space", "ArrowUp", "ArrowDown"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  };

  /** @notice Swap between deposit/redeem modal */
  const swapModal = () => {
    setDeposit(() => !deposit);

    // Refresh inputs on every modal swap
    setDepositAmount(ethers.utils.parseUnits("0"));

    setSharesAmount(ethers.utils.parseUnits("0"));
    setActionReceiver("");
    setSharesOwner("");

    if (receiverRef.current && amountRef.current) {
      amountRef.current.value = "";
      receiverRef.current.value = "";
    }
  };

  /** @notice Escape from connect modal */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeWalletModalHandler();
    }
  });

  /** @notice quick account */
  const myAddress = (e: any) => {
    if (active && account) {
      e.currentTarget.previousSibling.value = account;
      setActionReceiver(account);
    }
  };

  /** @notice quick owner */
  const myOwner = (e: any) => {
    if (active && account) {
      e.currentTarget.previousSibling.value = account;
      setSharesOwner(account);
    }
  };

  // ------------ Non-Constant functions -------------

  /** @notice Programmatically switch Metamask network to Localhost */
  const switchNetwork = async () => {
    if (active) {
      // Add Localhost to metamask if needed
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
  };

  /** @notice Approve assets before deposit */
  const approveAssets = async () => {
    if (active) {
      // Approve only once
      if (vaultAllowance?.gt(0)) return toast.info("Already approved.");

      const asset = new ethers.Contract(MY_VAULT_TOKEN_ADDRESS, ERC20Abi, library.getSigner());

      await toast.promise(
        asset
          .approve(ERC4626_VAULT_ADDRESS, ethers.constants.MaxUint256)
          .then((tx: any) => tx.wait()),
        {
          pending: "Approving Vault in ERC20 Token.",
          success: "Approve successful.",
          error: "Approve error.",
        },
      );

      // Refresh eth balance and trigger effect
      library
        .getBalance(account)
        .then((i: BigNumber) => setETHBalance((+ethers.utils.formatUnits(i)).toFixed(4)));
    }
  };

  /** @notice Deposit assets of `MY_VAULT_TOKEN` into the ERC4626 vault */
  const depositAssets = async () => {
    if (active) {
      if (depositAmount!.gt(vaultAllowance!)) return toast.warn("Approve asset first.");
      if (depositAmount!.eq(0)) return toast.warn(`Can't deposit 0 assets.`);
      if (actionReceiver === "") return toast.warn(`Empty receiver address.`);

      // Asset & Vault contracts
      const vaultToken = new ethers.Contract(
        ERC4626_VAULT_ADDRESS,
        ERC4626Abi,
        library.getSigner(),
      );

      await toast.promise(
        vaultToken.deposit(depositAmount, actionReceiver).then((tx: any) => tx.wait()),
        {
          pending: `Depositing ${ethers.utils.formatUnits(depositAmount)} assets.`,
          success: "Deposit successful.",
          error: "Deposit error.",
        },
      );

      // Refresh eth balance and trigger effect
      library
        .getBalance(account)
        .then((i: BigNumber) => setETHBalance((+ethers.utils.formatUnits(i)).toFixed(4)));
    }
  };

  /** @notice Redeem shares */
  const redeemShares = async () => {
    if (active) {
      if (sharesAmount!.eq(0)) return toast.warn(`Can't redeem 0 shares.`);
      if (actionReceiver === "") return toast.warn(`Empty receiver address.`);
      if (sharesOwner === "") return toast.warn(`Empty owner address.`);

      // Vault contract
      const vaultToken = new ethers.Contract(
        ERC4626_VAULT_ADDRESS,
        ERC4626Abi,
        library.getSigner(),
      );

      // Redeem
      await toast.promise(
        vaultToken.redeem(sharesAmount, actionReceiver, sharesOwner).then((tx: any) => tx.wait()),
        {
          pending: `Redeeming ${ethers.utils.formatUnits(sharesAmount)} shares from vault`,
          success: "Redeem successful",
          error: "Redeem error",
        },
      );

      // Refresh eth balance and trigger effect
      library
        .getBalance(account)
        .then((i: BigNumber) => setETHBalance((+ethers.utils.formatUnits(i)).toFixed(4)));
    }
  };

  // ------------ Effect -------------

  /**
   *  @notice Get ETH balance, signer balance of assets/shares, assets deposited, shares minted
   *  @notice Refreshes asset balance, shares balance, vault total supply, vault total assets deposited
   */
  useEffect(() => {
    if (active) {
      if (ETHBalance === undefined) {
        library
          .getBalance(account)
          .then((i: BigNumber) => setETHBalance((+ethers.utils.formatUnits(i)).toFixed(4)));
      }

      // Asset & Vault contracts
      const asset = new ethers.Contract(MY_VAULT_TOKEN_ADDRESS, ERC20Abi, library.getSigner());
      const vaultToken = new ethers.Contract(
        ERC4626_VAULT_ADDRESS,
        ERC4626Abi,
        library.getSigner(),
      );

      // User asset balance
      asset.balanceOf(account).then((i: BigNumber) => setAssetBalance(ethers.utils.formatUnits(i)));
      // User shares balance
      vaultToken
        .balanceOf(account)
        .then((i: BigNumber) => setSharesBalance(ethers.utils.formatUnits(i)));

      // Shares minted
      vaultToken.totalSupply().then((i: BigNumber) => setTotalShares(ethers.utils.formatUnits(i)));
      // Assets deposited
      vaultToken.totalAssets().then((i: BigNumber) => setTotalAssets(ethers.utils.formatUnits(i)));

      // Allowance
      asset.allowance(account, ERC4626_VAULT_ADDRESS).then((i: BigNumber) => setVaultAllowance(i));
    } else {
      setSharesBalance("0");
      setAssetBalance("0");
      setVaultAllowance(ethers.utils.parseUnits("0"));
    }
  }, [active, library, account, ETHBalance]);

  /** @notice Copy to clipboard */
  const copyText = (e: any) => {
    e.target.id === "tooltip-token"
      ? navigator.clipboard.writeText(MY_VAULT_TOKEN_ADDRESS)
      : navigator.clipboard.writeText(ERC4626_VAULT_ADDRESS);
  };

  return (
    <div className="page-home">
      <Modal isOpen={isWalletModalOpen} closeModalHandler={closeWalletModalHandler}>
        <div
          className="component-modal__modal__item"
          onClick={() => {
            connectMetamask();
            closeWalletModalHandler();
          }}
        >
          <img className="component-modal__modal__item__img" src={MetamaskLogo} alt="metamask" />
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
          <div className="component-modal__modal__item__text">WalletConnect</div>
        </div>
      </Modal>
      <header className="page-component__header">
        <div className="page-component__header__logo">
          <h2>ERC4626 VAULT</h2>
        </div>
        <div className="page-component__header__userinfo">
          <div className="page-component__header__network-btn" onClick={() => switchNetwork()}>
            {active ? (chainId === 31337 ? "Localhost" : "Switch to Localhost") : "Network"}
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
            {active ? (
              <>
                <div>{formatAddress(account)}</div>
                <div>&nbsp;|&nbsp;</div>
                <div>{`${ETHBalance} ETH`}</div>
              </>
            ) : (
              <div>Connect Wallet</div>
            )}
          </div>
        </div>
      </header>
      <main>
        <div className="page-component__main__action-modal">
          {deposit ? (
            <div className="page-component__main__form">
              <div className="page-component__main__action-modal-display">
                <div className="page-component__main__action-modal-display__item__action">
                  Deposit Assets
                </div>
                <div
                  className="page-component__main__action-modal-display__item"
                  onClick={() => swapModal()}
                >
                  Redeem Shares
                </div>
              </div>
              <div>
                <div className="page-component__main__actions">
                  <p>Assets</p>
                  <p className="page-component__main__actions-bal">{assetBalance}</p>
                </div>
                <div className="page-component__main__input">
                  <input
                    type="number"
                    placeholder="0.0"
                    onChange={(e: any) => setDepositAmount(ethers.utils.parseUnits(e.target.value))}
                    onKeyDown={e => removeScroll(e)}
                    autoComplete="off"
                    ref={amountRef}
                  />
                  <div
                    className="page-component__main__input__max-btn"
                    onClick={() => {
                      if (amountRef.current && assetBalance) {
                        amountRef.current.value = assetBalance;
                        setDepositAmount(ethers.utils.parseUnits(assetBalance));
                      }
                    }}
                  >
                    MAX
                  </div>
                </div>
              </div>
              <div>
                <div className="page-component__main__actions">
                  <p>Receiver</p>
                </div>
                <div className="page-component__main__input">
                  <input
                    type="text"
                    placeholder="0x124...5678"
                    onChange={(e: any) => setActionReceiver(e.target.value)}
                    onKeyDown={e => removeScroll(e)}
                    autoComplete="off"
                    ref={receiverRef}
                  />
                  <div
                    className="page-component__main__input__max-btn"
                    onClick={(e: any) => myAddress(e)}
                  >
                    ME
                  </div>
                </div>
              </div>
              <div>&nbsp;</div>
              <div className="page-component__main__input__btns">
                <div
                  className="page-component__main__input__action-btn"
                  onClick={() => approveAssets()}
                  style={{
                    backgroundColor: vaultAllowance?.gt(0) ? "#111" : "var(--color-purple)",
                  }}
                >
                  Approve
                </div>
                <div
                  className="page-component__main__input__action-btn"
                  onClick={() => depositAssets()}
                >
                  Deposit
                </div>
              </div>
            </div>
          ) : (
            <div className="page-component__main__form">
              <div className="page-component__main__action-modal-display">
                <div
                  className="page-component__main__action-modal-display__item"
                  onClick={() => swapModal()}
                >
                  Deposit Assets
                </div>
                <div className="page-component__main__action-modal-display__item__action">
                  Redeem Shares
                </div>
              </div>
              <div>
                <div className="page-component__main__actions">
                  <p>Shares</p>
                  <p className="page-component__main__actions-bal">{sharesBalance}</p>
                </div>
                <div className="page-component__main__input">
                  <input
                    type="number"
                    name="email"
                    placeholder="0.0"
                    onChange={(e: any) =>
                      setSharesAmount(ethers.utils.parseUnits(e.target.value, 18))
                    }
                    onKeyDown={(event: KeyboardEvent) => removeScroll(event)}
                    autoComplete="off"
                    ref={amountRef}
                  />
                  <div
                    className="page-component__main__input__max-btn"
                    onClick={() => {
                      if (amountRef.current && sharesBalance) {
                        amountRef.current.value = sharesBalance;
                        setSharesAmount(ethers.utils.parseUnits(sharesBalance));
                      }
                    }}
                  >
                    MAX
                  </div>
                </div>
              </div>
              <div>
                <div className="page-component__main__actions">
                  <p>Receiver</p>
                </div>
                <div className="page-component__main__input">
                  <input
                    type="text"
                    placeholder="0x124...5678"
                    onChange={(e: any) => setActionReceiver(e.target.value)}
                    onKeyDown={e => removeScroll(e)}
                    autoComplete="off"
                    ref={receiverRef}
                  />
                  <div
                    className="page-component__main__input__max-btn"
                    onClick={(e: any) => myAddress(e)}
                  >
                    ME
                  </div>
                </div>
              </div>
              <div>
                <div className="page-component__main__actions">
                  <p>Owner</p>
                </div>
                <div className="page-component__main__input">
                  <input
                    type="text"
                    placeholder="0x124...5678"
                    onChange={(e: any) => setSharesOwner(e.target.value)}
                    onKeyDown={e => removeScroll(e)}
                    autoComplete="off"
                  />
                  <div
                    className="page-component__main__input__max-btn"
                    onClick={(e: any) => myOwner(e)}
                  >
                    ME
                  </div>
                </div>
              </div>
              <div>&nbsp;</div>
              <div>
                <div
                  className="page-component__main__input__action-btn"
                  onClick={() => redeemShares()}
                >
                  Redeem
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="page-component__contract">
          <div className="page-component__contract-data">
            <div className="page-component__contract-data__title">
              <h2>Vault Balance</h2>
            </div>
            <div className="page-component__contract-data__body">
              <div className="page-component__contract-data__row">
                <div>Asset</div>
                <div
                  className="page-component__main__tooltip"
                  onClick={e => copyText(e)}
                  id="tooltip-token"
                >
                  {formatContractAddress(MY_VAULT_TOKEN_ADDRESS)}
                </div>
              </div>
              <div className="page-component__contract-data__row">
                <div>Vault</div>
                <div
                  className="page-component__main__tooltip"
                  onClick={e => copyText(e)}
                  style={{ cursor: "pointer" }}
                >
                  {formatContractAddress(ERC4626_VAULT_ADDRESS)}
                </div>
              </div>
              <div className="page-component__contract-data__row">
                <div>Total Assets</div>
                <div>{totalAssets}</div>
              </div>
              <div className="page-component__contract-data__row">
                <div>Total Shares</div>
                <div>{totalShares}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
