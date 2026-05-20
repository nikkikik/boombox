# Boombox Smart Contracts (Base Sepolia)

## Contracts

| File | Role |
|------|------|
| `BoomboxToken.sol` | ERC-20 **$BOOM** (18 decimals), mint only by game |
| `BoomboxGame.sol` | Game loop, daily check-in, rewards |

## Tokenomics

### Daily check-in
- `dailyCheckIn()` — once per **24 hours** (`CHECKIN_COOLDOWN`)
- Mints **100 BOOM** (`100 * 10^18`) to `msg.sender`

### Game (gas only — no ETH)
- `startGame()` — no `msg.value`
- `whack()` — no `msg.value`
- `nextLevel()` — no `msg.value`
- `cashOut()` — mints `potentialReward`, no `msg.value`

### Reward per successful level (`rewardForLevel`)
| Level | BOOM tokens |
|-------|-------------|
| 1 | 100 |
| 2 | 200 |
| 3 | 400 |
| 4 | 800 |
| 5 | 1,600 |
| 6 | 3,200 |
| 7 | 6,400 |
| 8 | 12,800 |
| 9+ | 25,600, 51,200… (×2 each level) |

Formula: `100 ether << (level - 1)` (= `100 * 10^18 * 2^(level-1)`).

On miss: `potentialReward = 0`, status `GameOver`.  
On hit: add round reward to `potentialReward`, status `Choosing`.  
`cashOut()` mints full `potentialReward`.

## Deploy (Foundry)

```bash
# Install Foundry: https://book.getfoundry.sh
cd /path/to/THREE
forge build

# Deploy token
forge create contracts/BoomboxToken.sol:BoomboxToken \
  --rpc-url https://sepolia.base.org \
  --private-key $DEPLOYER_KEY

# Deploy game (replace TOKEN)
forge create contracts/BoomboxGame.sol:BoomboxGame \
  --constructor-args $TOKEN_ADDRESS \
  --rpc-url https://sepolia.base.org \
  --private-key $DEPLOYER_KEY

# Link game as minter
cast send $TOKEN_ADDRESS "setGame(address)" $GAME_ADDRESS \
  --rpc-url https://sepolia.base.org \
  --private-key $DEPLOYER_KEY
```

`.env.local`:

```
NEXT_PUBLIC_BOOM_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=0x...
```
