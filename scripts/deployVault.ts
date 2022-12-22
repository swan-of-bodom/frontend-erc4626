import { ethers } from "hardhat";

/**
 * @notice Deploys an ERC20 token and its corresponding ERC4626 vault
 */
async function deployVault() {

  const [deployer] = await ethers.getSigners();

  /**
   *  @notice Deploy ERC20 token first, mints 100 M to the signer
   */
  const Token = await ethers.getContractFactory("MyVaultTokenERC20");
  const token = await Token.deploy();
  console.log(`Vault Token deployed to ${token.address}`);

  /**
   *  @notice Deploy ERC4626 Vault
   */
  const VaultToken = await ethers.getContractFactory("MyVaultTokenERC4626");
  const vaultToken = await VaultToken.deploy(token.address);
  console.log(`ERC4626 Vault for "${await token.name()}" deployed at ${vaultToken.address}`)

  console.log("--- ERC20 Token ---")
  console.log("Total Supply of Token: %s", await token.totalSupply());
  console.log("My Balance: %s", await token.balanceOf(deployer.address));
  console.log("\n")

  console.log("--- ERC4626 Vault ---")
  console.log("Total Supply: %s", await vaultToken.totalSupply());
  console.log("Total Balance: %s", await vaultToken.totalAssets());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployVault().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
