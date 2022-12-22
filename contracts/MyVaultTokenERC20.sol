// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC4626 } from "./token/ERC4626.sol";
import { ERC20 } from "./token/ERC20.sol";
import { IERC20 } from "./token/interfaces/IERC20.sol";
import { IERC20Metadata } from "./token/interfaces/IERC20Metadata.sol";

contract MyVaultTokenERC20 is ERC20 {
    /**
     *  @notice Deploys an ERC20 token and mints 100_000_000 to the deployer
     */
    constructor() ERC20("My Vault Token", "MVT") {
        _mint(_msgSender(), 100e18);
    }
}
