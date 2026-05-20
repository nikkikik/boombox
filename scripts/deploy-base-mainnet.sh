#!/usr/bin/env bash
# Deploy BoomboxToken + BoomboxGame to Base mainnet and link setGame().
#
# Prerequisites:
#   - Foundry (forge, cast)
#   - ETH on Base mainnet for gas
#   - export DEPLOYER_PRIVATE_KEY=0x...
#
# Usage:
#   ./scripts/deploy-base-mainnet.sh
#   # or with custom RPC:
#   BASE_RPC_URL=https://mainnet.base.org ./scripts/deploy-base-mainnet.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RPC_URL="${BASE_RPC_URL:-https://mainnet.base.org}"
CHAIN_ID=8453
DEPLOYMENTS_DIR="$ROOT/deployments"
OUT_FILE="$DEPLOYMENTS_DIR/base-mainnet.json"

if [[ -z "${DEPLOYER_PRIVATE_KEY:-}" ]]; then
  echo "Error: set DEPLOYER_PRIVATE_KEY (0x + 64 hex chars)"
  echo "  export DEPLOYER_PRIVATE_KEY=0xYOUR_KEY"
  exit 1
fi

DEPLOYER=$(cast wallet address --private-key "$DEPLOYER_PRIVATE_KEY")
echo "→ Deployer: $DEPLOYER"
echo "→ RPC: $RPC_URL (chain $CHAIN_ID)"

BALANCE=$(cast balance "$DEPLOYER" --rpc-url "$RPC_URL")
echo "→ Balance: $(cast --from-wei "$BALANCE" ether) ETH"
if [[ "$BALANCE" == "0" ]]; then
  echo "Error: deployer needs ETH on Base mainnet"
  exit 1
fi

echo "→ Building contracts..."
forge build

echo "→ Deploying BoomboxToken..."
TOKEN=$(forge create contracts/BoomboxToken.sol:BoomboxToken \
  --rpc-url "$RPC_URL" \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --json | python3 -c "import sys,json; print(json.load(sys.stdin)['deployedTo'])")
echo "   Token: $TOKEN"

echo "→ Deploying BoomboxGame..."
GAME=$(forge create contracts/BoomboxGame.sol:BoomboxGame \
  --constructor-args "$TOKEN" \
  --rpc-url "$RPC_URL" \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --json | python3 -c "import sys,json; print(json.load(sys.stdin)['deployedTo'])")
echo "   Game:  $GAME"

echo "→ Linking token.setGame(game)..."
cast send "$TOKEN" "setGame(address)" "$GAME" \
  --rpc-url "$RPC_URL" \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --confirmations 1 >/dev/null

LINKED=$(cast call "$TOKEN" "game()(address)" --rpc-url "$RPC_URL")
if [[ "${LINKED,,}" != "${GAME,,}" ]]; then
  echo "Error: setGame verification failed (got $LINKED)"
  exit 1
fi

BOOM_REF=$(cast call "$GAME" "boom()(address)" --rpc-url "$RPC_URL")
if [[ "${BOOM_REF,,}" != "${TOKEN,,}" ]]; then
  echo "Error: game.boom() mismatch"
  exit 1
fi

mkdir -p "$DEPLOYMENTS_DIR"
cat > "$OUT_FILE" <<EOF
{
  "chainId": $CHAIN_ID,
  "network": "base-mainnet",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployer": "$DEPLOYER",
  "boomToken": "$TOKEN",
  "boomGame": "$GAME"
}
EOF

echo ""
echo "✓ Deployment successful"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "NEXT_PUBLIC_USE_MAINNET=true"
echo "NEXT_PUBLIC_BOOM_TOKEN_ADDRESS=$TOKEN"
echo "NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=$GAME"
echo "NEXT_PUBLIC_BASE_MAINNET_RPC_URL=$RPC_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Saved: $OUT_FILE"
echo ""
echo "Add the env vars above to Vercel → Settings → Environment Variables, then redeploy."
