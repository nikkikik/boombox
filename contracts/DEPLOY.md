# Deploy to Base Mainnet

Contracts in this repo: **BoomboxToken** (ERC-20 BOOM) + **BoomboxGame** (mint via `setGame`).

## One-command deploy

```bash
export DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY   # wallet with ETH on Base
chmod +x scripts/deploy-base-mainnet.sh
./scripts/deploy-base-mainnet.sh
```

Output: `deployments/base-mainnet.json` + env vars for Vercel.

## Manual steps

```bash
forge build

# 1. Token
forge create contracts/BoomboxToken.sol:BoomboxToken \
  --rpc-url https://mainnet.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY

# 2. Game (replace TOKEN)
forge create contracts/BoomboxGame.sol:BoomboxGame \
  --constructor-args TOKEN \
  --rpc-url https://mainnet.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY

# 3. Link (replace TOKEN, GAME)
cast send TOKEN "setGame(address)" GAME \
  --rpc-url https://mainnet.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY

# 4. Verify
cast call TOKEN "game()(address)" --rpc-url https://mainnet.base.org
cast call GAME "boom()(address)" --rpc-url https://mainnet.base.org
```

## Frontend / Vercel env

```
NEXT_PUBLIC_USE_MAINNET=true
NEXT_PUBLIC_BOOM_TOKEN_ADDRESS=<from deploy>
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=<from deploy>
```

Redeploy Vercel after updating variables.

## Verify mint works

After deploy, call `dailyCheckIn()` from the app (or cast). Then:

```bash
cast call TOKEN "totalSupply()(uint256)" --rpc-url https://mainnet.base.org
cast call TOKEN "balanceOf(address)(uint256)" YOUR_WALLET --rpc-url https://mainnet.base.org
```

`totalSupply` and your balance should be > 0 after check-in.
