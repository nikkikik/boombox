// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BoomboxToken} from "./BoomboxToken.sol";

/// @title BoomboxGame — Hybrid: local whack on frontend, single-tx commit on Cash Out / Next Level
contract BoomboxGame {
    BoomboxToken public immutable boom;

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

    uint8[8] public levelChances = [100, 80, 70, 60, 50, 40, 30, 20];

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

    constructor(BoomboxToken boom_) {
        require(address(boom_) != address(0), "Zero token");
        boom = boom_;
    }

    function getLevelChance(uint8 level) public view returns (uint8) {
        if (level == 0) return 0;
        if (level > levelChances.length) return levelChances[levelChances.length - 1];
        return levelChances[level - 1];
    }

    function rewardForLevel(uint8 level) public pure returns (uint256) {
        require(level >= 1, "Invalid level");
        return BASE_ROUND_REWARD << (level - 1);
    }

    function canDailyCheckIn(address player) external view returns (bool) {
        return block.timestamp >= players[player].lastCheckInAt + CHECKIN_COOLDOWN;
    }

    function dailyCheckIn() external {
        PlayerState storage p = players[msg.sender];
        require(
            block.timestamp >= p.lastCheckInAt + CHECKIN_COOLDOWN,
            "Check-in cooldown"
        );
        p.lastCheckInAt = block.timestamp;
        boom.mint(msg.sender, DAILY_CHECKIN_REWARD);
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

    function _commitLoss(PlayerState storage p) internal {
        p.potentialReward = 0;
        p.status = GameStatus.GameOver;
        emit ResultSubmitted(msg.sender, false, 0, 0);
        emit GameOver(msg.sender);
    }

    function _commitWin(PlayerState storage p, uint256 reward) internal {
        require(reward > 0, "Zero reward");
        require(reward == rewardForLevel(p.level), "Reward mismatch");
        p.potentialReward += reward;
        emit ResultSubmitted(msg.sender, true, reward, p.potentialReward);
    }

    /// @notice Commit whack result and mint banked $BOOM in one transaction
    function cashOut(bool won, uint256 reward) external {
        PlayerState storage p = players[msg.sender];
        require(p.status == GameStatus.Playing, "Not playing");

        if (!won) {
            _commitLoss(p);
            return;
        }

        _commitWin(p, reward);

        uint256 amount = p.potentialReward;
        p.potentialReward = 0;
        p.level = 0;
        p.status = GameStatus.Idle;

        boom.mint(msg.sender, amount);
        emit CashOut(msg.sender, amount);
    }

    /// @notice Commit whack result and advance to the next level in one transaction
    function nextLevel(bool won, uint256 reward) external {
        PlayerState storage p = players[msg.sender];
        require(p.status == GameStatus.Playing, "Not playing");

        if (!won) {
            _commitLoss(p);
            return;
        }

        _commitWin(p, reward);
        require(p.level < type(uint8).max, "Max level");

        p.level += 1;
        p.status = GameStatus.Playing;
        emit NextLevel(msg.sender, p.level);
    }
}
