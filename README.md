## Frontend for ERC4626 vaults using OpenZeppelin implementation

```
git clone https://github.com/0xHyoga/frontend-erc4626`

cd ./frontend-erc4626 && npm install

cd ./frontend-erc4626/frontend && npm install

npx hardhat node

npx hardhat run ./deployVault.ts --network localhost

npm start
```

Note: The vault deploys and assigns 100 ERC20 tokens to 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 so add to Metamask
