// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BoomboxToken} from "./BoomboxToken.sol";

/// @title BoomboxGameV1 — Matches Base mainnet deployment (hybrid two-step commit)
contract BoomboxGameV1 {
    BoomboxToken public immutable token;

    uint256 public constant BASE_ROUND_REWARD = 100 ether;
    uint256 public constant DAILY_CHECKIN_REWARD = 100 ether;
    uint256 public constant CHECKIN_COOLDOWN = 24 hours;

    enum GameStatus {
        Idle,
        Playing,
        Choosing,
        GameOver
    }

    struct PlayerState {
        GameStatus status;
        uint8 level;
        uint256 potentialReward;
        uint256 lastCheckInAt;
        uint256 nonce;
    }

    mapping(address => PlayerState) public players;

    event GameStarted(address indexed player, uint8 level);
    event ResultSubmitted(
        address indexed player,
        bool won,
        uint256 reward,
        uint256 potentialReward
    );
    event CashOut(address indexed player, uint256 amountMinted);
    event NextLevel(address indexed player, uint8 newLevel);
    event GameOver(address indexed player);
    event DailyCheckIn(address indexed player, uint256 amountMinted);

    constructor(BoomboxToken token_) {
        require(address(token_) != address(0), "Zero token");
        token = token_;
    }

    function _rewardForLevel(uint8 level) internal pure returns (uint256) {
        require(level >= 1, "Invalid level");
        return BASE_ROUND_REWARD << (level - 1);
    }

    function dailyCheckIn() external {
        PlayerState storage p = players[msg.sender];
        require(
            block.timestamp >= p.lastCheckInAt + CHECKIN_COOLDOWN,
            "Check-in cooldown"
        );
        p.lastCheckInAt = block.timestamp;
        token.mint(msg.sender, DAILY_CHECKIN_REWARD);
        emit DailyCheckIn(msg.sender, DAILY_CHECKIN_REWARD);
    }

    function startGame() external {
        PlayerState storage p = players[msg.sender];
        require(
            p.status == GameStatus.Idle || p.status == GameStatus.GameOver,
            "Finish or cash out first"
        );
        p.status = GameStatus.Playing;
        p.level = 1;
        p.potentialReward = 0;
        p.nonce++;
        emit GameStarted(msg.sender, 1);
    }

    function submitResult(bool won, uint256 reward) external {
        PlayerState storage p = players[msg.sender];
        require(p.status == GameStatus.Playing, "Not playing");

        if (!won) {
            p.potentialReward = 0;
            p.status = GameStatus.GameOver;
            emit ResultSubmitted(msg.sender, false, 0, 0);
            emit GameOver(msg.sender);
            return;
        }

        require(reward > 0, "Zero reward");
        require(reward == _rewardForLevel(p.level), "Reward mismatch");

        p.potentialReward += reward;
        p.status = GameStatus.Choosing;
        emit ResultSubmitted(msg.sender, true, reward, p.potentialReward);
    }

    function cashOut() external {
        PlayerState storage p = players[msg.sender];
        require(p.status == GameStatus.Choosing, "Not choosing");
        uint256 amount = p.potentialReward;
        require(amount > 0, "Nothing to claim");

        p.potentialReward = 0;
        p.level = 0;
        p.status = GameStatus.Idle;

        token.mint(msg.sender, amount);
        emit CashOut(msg.sender, amount);
    }

    function nextLevel() external {
        PlayerState storage p = players[msg.sender];
        require(p.status == GameStatus.Choosing, "Not choosing");
        require(p.level < type(uint8).max, "Max level");

        p.level += 1;
        p.status = GameStatus.Playing;
        emit NextLevel(msg.sender, p.level);
    }
}
