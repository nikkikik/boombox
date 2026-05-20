# Boombox Smart Contracts (Base Sepolia)

## Contracts

| File | Role |
|------|------|
| `BoomboxToken.sol` | ERC-20 **$BOOM** (18 decimals), mint only by game |
| `BoomboxGame.sol` | Hybrid game: frontend whack, single-tx `cashOut` / `nextLevel` |

## Game flow

- **Whack** — off-chain (frontend rolls `levelChances`)
- **`nextLevel(bool won, uint256 reward)`** — commits win + advances level in **one tx**
- **`cashOut(bool won, uint256 reward)`** — commits win + mints bank in **one tx**
- **`nextLevel(false, 0)`** — forfeit / close stale run before `startGame`

### Reward per level

`100 * 10^18 * 2^(level-1)` — see `rewardForLevel()`.

## Regenerate ABI

```bash
forge build
node -e "const fs=require('fs');const a=JSON.parse(fs.readFileSync('out/BoomboxGame.sol/BoomboxGame.json'));fs.writeFileSync('src/contracts/abi/BoomboxGame.json',JSON.stringify(a.abi,null,2));"
```
