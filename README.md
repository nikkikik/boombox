# Boombox Warplet12345

Cosmic Whack-a-Mole mini-app for **Base Mainnet** and **Farcaster**. Hit Warplets, stack multipliers, cash out or risk the next round.

Configured per the [Base app quickstart](https://docs.base.org/apps/quickstart/build-app): `baseAccount` connector, Base Mainnet only, SSR-safe wagmi + cookie storage.

## Contracts (Base Mainnet v2)

| Contract | Address |
|----------|---------|
| **BoomboxToken** | `0x63bBE8362b4e25D51AD0A86c7e45d3B2779E5f6C` |
| **BoomboxGame** | `0xc45D9d59842128eFb32E2644a227431c62d0919A` |

Addresses are defined in `src/constants/addresses.ts`. Game flow uses single-tx `cashOut(won, reward)` and `nextLevel(won, reward)`.

- [Game on BaseScan](https://basescan.org/address/0xc45D9d59842128eFb32E2644a227431c62d0919A)
- [Token on BaseScan](https://basescan.org/address/0x63bBE8362b4e25D51AD0A86c7e45d3B2779E5f6C)

## Stack

- Next.js 15 · Tailwind · Framer Motion
- wagmi · viem · `@base-org/account` (Base Smart Wallet)
- @farcaster/frame-sdk · `@farcaster/miniapp-wagmi-connector`

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: custom RPC
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### If localhost stops working

| Symptom | Fix |
|--------|-----|
| Connection refused | `npm run dev` |
| HTTP 500 / white screen | `npm run restart` |
| Wrong port | Use **http://localhost:3000** |

## Wallet & network

1. Click **Connect Wallet**.
2. Use **Base Account** (Coinbase Smart Wallet), **Farcaster**, or a browser wallet (MetaMask).
3. Switch to **Base Mainnet** if prompted.

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BASE_MAINNET_RPC_URL` | Optional custom RPC (Alchemy/Infura recommended for production) |
| `ETHERSCAN_API_KEY` | Local only — for `forge verify` / BaseScan scripts |

## Game config

Spawn weights and stages: `src/lib/gameConfig.ts`

## Deploy

Push to GitHub → deploy on Vercel (Next.js preset). Set `NEXT_PUBLIC_BASE_MAINNET_RPC_URL` in Vercel env for production.

## Verify contracts

See `contracts/VERIFY-BASESCAN.md`.
