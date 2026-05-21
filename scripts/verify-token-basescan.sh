#!/usr/bin/env bash
# Verify BoomboxToken on Base (Sourcify + Etherscan V2 API)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then set -a; source .env.local; set +a; fi
: "${ETHERSCAN_API_KEY:?Set ETHERSCAN_API_KEY in .env.local}"

TOKEN="0x63bBE8362b4e25D51AD0A86c7e45d3B2779E5f6C"
SOLC="v0.8.20+commit.a1b79de638db793768483ddad3efe5277499397"

echo "→ Building (no optimization, matches Remix)..."
FOUNDRY_PROFILE=noopt forge build --contracts contracts/BoomboxTokenRemix.sol --evm-version osaka --force

echo "→ Export standard JSON..."
FOUNDRY_PROFILE=noopt forge verify-contract "$TOKEN" \
  contracts/BoomboxTokenRemix.sol:BoomboxToken \
  --chain base --show-standard-json-input > /tmp/boom-token-std.json

echo "→ Sourcify verify..."
curl -s -X POST "https://sourcify.dev/server/v2/verify/8453/$TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"stdJsonInput\": $(cat /tmp/boom-token-std.json), \"compilerVersion\": \"$SOLC\", \"contractIdentifier\": \"contracts/BoomboxTokenRemix.sol:BoomboxToken\"}"
echo ""

echo "→ BaseScan / Etherscan V2 submit (standard-json)..."
python3 <<PY
import urllib.request, urllib.parse, os, json
api=os.environ["ETHERSCAN_API_KEY"]
std=open("/tmp/boom-token-std.json").read()
body=urllib.parse.urlencode({
    "apikey": api,
    "module": "contract",
    "action": "verifysourcecode",
    "contractaddress": "$TOKEN",
    "sourceCode": std,
    "codeformat": "solidity-standard-json-input",
    "contractname": "contracts/BoomboxTokenRemix.sol:BoomboxToken",
    "compilerversion": "$SOLC",
    "optimizationUsed": "0",
    "runs": "200",
    "licenseType": "3",
}).encode()
req=urllib.request.Request("https://api.etherscan.io/v2/api?chainid=8453", data=body, method="POST")
print(urllib.request.urlopen(req, timeout=120).read().decode())
PY

echo ""
echo "Check:"
echo "  Sourcify:  https://repo.sourcify.dev/contracts/full_match/8453/$TOKEN"
echo "  Blockscout: https://base.blockscout.com/address/$TOKEN#code"
echo "  BaseScan:   https://basescan.org/address/$TOKEN#code"
