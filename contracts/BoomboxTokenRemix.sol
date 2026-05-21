// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Exact Remix deploy source (OpenZeppelin ERC20 + Ownable)
contract BoomboxToken is ERC20, Ownable {
    address public game;

    constructor() ERC20("Boombox", "BOOM") Ownable(msg.sender) {}

    function setGame(address _game) external onlyOwner {
        game = _game;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == game, "Only game can mint");
        _mint(to, amount);
    }
}
