// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BoomboxToken} from "../contracts/BoomboxToken.sol";
import {BoomboxGame} from "../contracts/BoomboxGame.sol";

/// @notice Run: forge script script/Deploy.s.sol:Deploy --rpc-url $RPC --broadcast
contract Deploy {
    function run() external returns (address token, address game) {
        BoomboxToken boomToken = new BoomboxToken();
        BoomboxGame boomGame = new BoomboxGame(boomToken);
        boomToken.setGame(address(boomGame));

        require(boomToken.game() == address(boomGame), "setGame failed");
        require(address(boomGame.boom()) == address(boomToken), "game.boom mismatch");

        return (address(boomToken), address(boomGame));
    }
}
