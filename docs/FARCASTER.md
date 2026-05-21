# Публикация Boombox в Farcaster (Mini App)

Production URL: **https://boombox-one.vercel.app**

## Что уже настроено в коде

| Файл | Назначение |
|------|------------|
| `src/app/.well-known/farcaster.json/route.ts` | Manifest Mini App |
| `public/icon.png` | Иконка Mini App 1024×1024 |
| `public/splash.png` | Splash 200×200 |
| `src/app/opengraph-image.tsx` | OG / hero 1200×630 |
| `src/hooks/useFarcasterMiniApp.ts` | `sdk.actions.ready()` в Warpcast |
| `src/config/wagmi.ts` | `farcasterMiniApp()` connector |

Проверка manifest после деплоя:

```text
https://boombox-one.vercel.app/.well-known/farcaster.json
```

## Шаг 1 — Vercel env

В **Settings → Environment Variables**:

```env
NEXT_PUBLIC_APP_URL=https://boombox-one.vercel.app
```

Опционально (после верификации домена):

```env
FARCASTER_ACCOUNT_ASSOCIATION_HEADER=...
FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD=...
FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE=...
```

Redeploy после изменений.

## Шаг 2 — Верификация домена

**Уже в коде** для `boombox-one.vercel.app` (fid `770246`):

- `accountAssociation` в `src/lib/farcasterManifest.ts`
- `webhookUrl`: `/api/webhook`
- URL картинок: `/icon.png`, `/splash.png` (статика в `public/`), `/image.png` (OG)

После деплоя проверьте manifest — в JSON должны быть `accountAssociation` и `miniapp` / `frame`.

## Шаг 3 — Hosted manifest (опционально)

Если не хотите хранить manifest в коде:

1. Создайте hosted manifest на [farcaster.xyz/~/developers/mini-apps/manifest](https://farcaster.xyz/~/developers/mini-apps/manifest)
2. Добавьте в `next.config.ts`:

```ts
async redirects() {
  return [
    {
      source: "/.well-known/farcaster.json",
      destination: "https://api.farcaster.xyz/miniapps/hosted-manifest/YOUR_ID",
      permanent: false,
    },
  ];
},
```

## Шаг 4 — Превью в Warpcast

1. Создайте cast со ссылкой: `https://boombox-one.vercel.app`
2. Должна появиться карточка **Play Boombox**
3. Откройте Mini App внутри Warpcast — кошелёк Farcaster + игра на Base

## Шаг 5 — Каталог / rewards

- [Mini App Rewards](https://farcaster.xyz/~/mini-apps/rewards) — после verified + usage
- Добавьте 2–3 скриншота (1284×2778) в manifest через Developer Tools
- Категория: `games`, теги: `base`, `game`, `warplet`

## Чеклист перед сабмитом

- [ ] `/.well-known/farcaster.json` открывается в браузере
- [ ] `/icon` и `/splash` отдают PNG
- [ ] `base:app_id` meta на главной (Base Build)
- [ ] account association в manifest (verified)
- [ ] Игра открывается из Warpcast, `ready()` без вечного лоадера
