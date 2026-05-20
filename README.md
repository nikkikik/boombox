# Boombox Warplet

Cosmic Whack-a-Mole mini-app for **Base** and **Farcaster**. Hit Warplets, stack multipliers, cash out or risk the next round.

Configured per the [Base app quickstart](https://docs.base.org/apps/quickstart/build-app): `baseAccount` connector, Base Sepolia, SSR-safe wagmi + cookie storage.

## Stack

- Next.js 15 · Tailwind · Framer Motion
- wagmi · viem · `@base-org/account` (Base Smart Wallet)
- @farcaster/frame-sdk

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Keep that terminal open** — closing it stops the server.

### If localhost stops working

This is usually **not** caused by every code edit. Common causes:

| Symptom | Likely cause | Fix |
|--------|----------------|-----|
| Connection refused | Dev server not running (terminal closed) | `npm run dev` |
| HTTP 500 / white screen | Corrupted `.next` (often after `npm run build` while dev was running) | `npm run restart` |
| Wrong port / old tab | Second server on 3001 | Use **http://localhost:3000** or `npm run restart` |

**One command fix** (kills old processes, clears cache, starts fresh):

```bash
npm run restart
```

In Cursor: **Terminal → Run Task… → “Boombox: restart (clean cache)”**.

Hot reload (HMR) should work for normal edits — you only need `restart` when the page is actually broken.

## Base wallet

1. Click **Connect Wallet** in the header.
2. Connect via **Base Account** (smart wallet) or browser wallet (MetaMask).
3. App uses **Base Sepolia** by default — get test ETH from [Base faucets](https://docs.base.org/base-chain/network-information/network-faucets).

## Save score onchain

1. Install [Foundry](https://book.getfoundry.sh/getting-started/installation).
2. Deploy to Base Sepolia:

```bash
cd contracts
forge init --no-git  # skip if already initialized
# copy BoomboxScore.sol into src/ if needed
forge create src/BoomboxScore.sol:BoomboxScore \
  --rpc-url https://sepolia.base.org \
  --private-key $YOUR_DEPLOYER_KEY
```

3. Copy contract address to `.env.local`:

```
NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS=0xYourAddress
```

4. Restart `npm run dev` and use **Save on Base**.

## Environment

Copy `.env.example` → `.env.local`.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS` | Deployed BoomboxScore contract |
| `NEXT_PUBLIC_USE_MAINNET` | `true` = Base mainnet, else Sepolia |
| `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` | Optional custom RPC |

## Game config

Spawn weights and stages: `src/lib/gameConfig.ts`

## Deploy

Push to GitHub → deploy on Vercel (Next.js preset).
