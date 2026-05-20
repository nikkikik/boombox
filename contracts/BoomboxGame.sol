// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BoomboxToken} from "./BoomboxToken.sol";

/// @title BoomboxGame — Pay gas only; $BOOM rewards with x2 progression per level
/// @dev Deploy BoomboxToken first, then setGame(game), then wire token in constructor
contract BoomboxGame {
    BoomboxToken public immutable boom;

    uint256 public constant BASE_ROUND_REWARD = 100 ether; // 100 BOOM (18 decimals)
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

    /// @notice Level 1–8+ hit chance (percent 0–100). Level 8+ uses 20%.
    uint8[8] public levelChances = [100, 80, 70, 60, 50, 40, 30, 20];

    event GameStarted(address indexed player, uint8 level);
    event WhackResult(address indexed player, bool success, uint8 level, uint256 roundReward, uint256 potentialReward);
    event CashOut(address indexed player, uint256 amountMinted);
    event NextLevel(address indexed player, uint8 newLevel);
    event GameOver(address indexed player);
    event DailyCheckIn(address indexed player, uint256 amountMinted);

    constructor(BoomboxToken boom_) {
        require(address(boom_) != address(0), "Zero token");
        boom = boom_;
    }

    // --- Views ---

    function getLevelChance(uint8 level) public view returns (uint8) {
        if (level == 0) return 0;
        if (level > levelChances.length) return levelChances[levelChances.length - 1];
        return levelChances[level - 1];
    }

    /// @notice Reward for successful whack at `level`: 100, 200, 400 … (×2 each level)
    function rewardForLevel(uint8 level) public pure returns (uint256) {
        require(level >= 1, "Invalid level");
        return BASE_ROUND_REWARD << (level - 1);
    }

    function canDailyCheckIn(address player) external view returns (bool) {
        return block.timestamp >= players[player].lastCheckInAt + CHECKIN_COOLDOWN;
    }

    // --- Daily check-in ---

    /// @notice Mint 100 $BOOM if 24h passed since last check-in
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

    // --- Game loop (gas only, no ETH payment) ---

    /// @notice Start a new run at level 1. No msg.value required.
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

    /// @notice One whack attempt for current level. No msg.value required.
    function whack() external {
        PlayerState storage p = players[msg.sender];
        require(p.status == GameStatus.Playing, "Not playing");
        require(p.level >= 1, "Invalid level");

        bool success = _rollSuccess(msg.sender, p.level, p.nonce);
        p.nonce++;

        if (!success) {
            p.potentialReward = 0;
            p.status = GameStatus.GameOver;
            emit WhackResult(msg.sender, false, p.level, 0, 0);
            emit GameOver(msg.sender);
            return;
        }

        uint256 roundReward = rewardForLevel(p.level);
        p.potentialReward += roundReward;
        p.status = GameStatus.Choosing;

        emit WhackResult(msg.sender, true, p.level, roundReward, p.potentialReward);
    }

    /// @notice Mint accumulated potentialReward and reset run. No msg.value required.
    function cashOut() external {
        PlayerState storage p = players[msg.sender];
        require(p.status == GameStatus.Choosing, "Not choosing");
        uint256 amount = p.potentialReward;
        require(amount > 0, "Nothing to claim");

        p.potentialReward = 0;
        p.level = 0;
        p.status = GameStatus.Idle;

        boom.mint(msg.sender, amount);
        emit CashOut(msg.sender, amount);
    }

    /// @notice Risk next level (one more whack). No payment, no msg.value.
    function nextLevel() external {
        PlayerState storage p = players[msg.sender];
        require(p.status == GameStatus.Choosing, "Not choosing");
        require(p.level < type(uint8).max, "Max level");

        p.level += 1;
        p.status = GameStatus.Playing;
        emit NextLevel(msg.sender, p.level);
    }

    // --- Internal ---

    function _rollSuccess(address player, uint8 level, uint256 nonce) internal view returns (bool) {
        uint8 chance = getLevelChance(level);
        if (chance >= 100) return true;
        if (chance == 0) return false;

        uint256 roll = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    player,
                    nonce,
                    address(this)
                )
            )
        ) % 100;

        return roll < chance;
    }
}
