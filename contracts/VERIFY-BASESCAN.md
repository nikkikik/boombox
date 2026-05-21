# Верификация на BaseScan

## Статус

| Контракт | Адрес | BaseScan | Sourcify | Blockscout |
|----------|-------|----------|----------|------------|
| **BoomboxGame** | `0xc45D9d59842128eFb32E2644a227431c62d0919A` | **Verified** | match | verified |
| **BoomboxToken** | `0x63bBE8362b4e25D51AD0A86c7e45d3B2779E5f6C` | UI ещё bytecode* | **exact_match** | **verified** |

\* BaseScan API (free tier) не отдаёт ABI; исходник подтверждён Sourcify/Blockscout. См. ссылки ниже.

---

## BoomboxToken — настройки из Remix (твои скрины)

- **Файл:** `BoomboxToken.sol` (OpenZeppelin `ERC20` + `Ownable`)
- **Compiler:** `0.8.20+commit.a1b79de6`
- **Optimization:** **выключена** (галочка снята)
- **EVM:** default (osaka)
- **Constructor args:** нет

### Просмотр верифицированного исходника (уже работает)

- **Sourcify:** https://repo.sourcify.dev/contracts/full_match/8453/0x63bBE8362b4e25D51AD0A86c7e45d3B2779E5f6C  
- **Blockscout:** https://base.blockscout.com/address/0x63bBE8362b4e25D51AD0A86c7e45d3B2779E5f6C#code  

Автоповтор: `./scripts/verify-token-basescan.sh` (Sourcify + submit в Etherscan V2).

### Самый простой способ для галочки на BaseScan — плагин в Remix

1. В Remix: плагин **Contract Verification** (Etherscan)
2. Вставь API key BaseScan (тот же, что в `.env.local`)
3. **Contract Address:** `0x63bBE8362b4e25D51AD0A86c7e45d3B2779E5f6C`
4. **Contract Name:** `BoomboxToken`
5. **Compiler:** `0.8.20+commit.a1b79de6`
6. **Optimization:** No
7. **Chain:** Base Mainnet
8. Verify

Remix использует тот же компилятор и OpenZeppelin, что при деплое — верификация почти всегда проходит с первого раза.

### Альтернатива — вручную на BaseScan

1. https://basescan.org/verifyContract?a=0x63bBE8362b4e25D51AD0A86c7e45d3B2779E5f6C
2. **Solidity (Single file)** → вставь `contracts/BoomboxTokenRemix_flat.sol` (flatten с OpenZeppelin)
3. Contract name: `BoomboxToken`
4. Compiler `0.8.20`, Optimization **No**
5. Constructor: пусто

---

## BoomboxGame — уже верифицирован

```bash
source .env.local
forge verify-contract 0xc45D9d59842128eFb32E2644a227431c62d0919A \
  contracts/BoomboxGame.sol:BoomboxGame \
  --chain base --etherscan-api-key "$ETHERSCAN_API_KEY" \
  --constructor-args $(cast abi-encode "constructor(address)" 0x63bBE8362b4e25D51AD0A86c7e45d3B2779E5f6C) \
  --compiler-version "v0.8.20+commit.a1b79de638db793768483ddad3efe5277499397" \
  --num-of-optimizations 0 --watch
```

---

## Исходник токена в репозитории

`contracts/BoomboxTokenRemix.sol` — совпадает с твоим Remix-файлом (`setGame`, `"Only game can mint"`).
