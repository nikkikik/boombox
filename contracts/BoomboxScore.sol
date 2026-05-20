// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BoomboxScore — onchain high scores for Boombox Warplet (Base)
contract BoomboxScore {
    mapping(address => uint256) public scores;

    event ScoreSaved(address indexed player, uint256 score);

    function saveScore(uint256 score) external {
        if (score > scores[msg.sender]) {
            scores[msg.sender] = score;
            emit ScoreSaved(msg.sender, score);
        }
    }
}
