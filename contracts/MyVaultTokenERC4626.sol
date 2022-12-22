// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC4626 } from "./token/ERC4626.sol";
import { ERC20 } from "./token/ERC20.sol";
import { IERC20 } from "./token/interfaces/IERC20.sol";
import { IERC20Metadata } from "./token/interfaces/IERC20Metadata.sol";

contract MyVaultTokenERC4626 is ERC4626 {
    /**
     * @notice Deploys the ERC4626 vault for `VaultToken`
     */
    constructor(IERC20Metadata asset) ERC20(asset.name(), asset.symbol()) ERC4626(asset) {}
}
