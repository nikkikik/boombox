// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// =============================================================================
// Boombox — deploy via Remix on Base Mainnet
// 1) Deploy BoomboxToken (no constructor args)
// 2) Deploy BoomboxGame( tokenAddress )
// 3) On token: setGame( gameAddress ) — only deployer wallet
// 4) Update addresses in frontend src/constants/addresses.ts
// =============================================================================

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title BoomboxToken — $BOOM (18 decimals), mint only by BoomboxGame
contract BoomboxToken is IERC20 {
    string public constant name = "Boombox";
    string public constant symbol = "BOOM";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;
    address public game;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event GameContractSet(address indexed game);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyGame() {
        require(msg.sender == game, "Only game");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setGame(address game_) external onlyOwner {
        require(game_ != address(0), "Zero game");
        game = game_;
        emit GameContractSet(game_);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "Allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyGame {
        require(to != address(0), "Zero to");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "Zero to");
        require(balanceOf[from] >= amount, "Balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}

/// @title BoomboxGame — local whack on UI; one tx on Cash Out / Next Level
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

    /// @notice Win + mint bank in one tx. reward = 100e18 * 2^(level-1)
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

    /// @notice Win + advance level in one tx. reward = 100e18 * 2^(level-1)
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
