# Деплой через Remix (Base Mainnet)

Файл для копирования в Remix: **`BoomboxRemix.sol`** (всё в одном файле).

## Remix

1. Открой https://remix.ethereum.org
2. Создай файл `BoomboxRemix.sol` и вставь содержимое из `contracts/remix/BoomboxRemix.sol`
3. **Compiler:** Solidity `0.8.20` (или 0.8.24), включи **Optimization** (200 runs)
4. **Deploy & Run:** Environment → **Injected Provider** (MetaMask), сеть **Base Mainnet**
5. На кошельке должен быть ETH на Base для газа

## Порядок деплоя

| Шаг | Контракт | Constructor | Действие |
|-----|----------|-------------|----------|
| 1 | `BoomboxToken` | *(пусто)* | Deploy → скопируй адрес **TOKEN** |
| 2 | `BoomboxGame` | `_boom`: адрес TOKEN | Deploy → скопируй адрес **GAME** |
| 3 | `BoomboxToken` | — | Вызови `setGame(GAME)` с кошелька деплоера |

Проверка:

- `token.game()` → адрес GAME  
- `game.boom()` → адрес TOKEN  

## После деплоя

Обнови в проекте `src/constants/addresses.ts`:

```ts
export const BOOM_TOKEN_ADDRESS = "0x..."; // TOKEN
export const GAME_CONTRACT_ADDRESS = "0x..."; // GAME
```

Передеплой фронт на Vercel.

## API игры (v2 — одна транзакция)

- `startGame()`
- `cashOut(bool won, uint256 reward)` — при победе `won=true`, `reward = 100 * 10^18 * 2^(level-1)`
- `nextLevel(bool won, uint256 reward)` — то же для перехода на уровень
- `dailyCheckIn()` — 100 BOOM раз в 24ч

Старый mainnet-контракт (`submitResult` + `cashOut()` без аргументов) **не совместим** с этой версией.

## Награды по уровню

| Level | reward (wei) | BOOM |
|-------|----------------|------|
| 1 | 100e18 | 100 |
| 2 | 200e18 | 200 |
| 3 | 400e18 | 400 |
| 4 | 800e18 | 800 |

Формула: `reward = 100 ether << (level - 1)`
