import { APP_URL } from "@/constants/appUrl";

/** Bump path when Farcaster caches an old icon (clients cache by URL). */
const MINIAPP_ICON_URL = `${APP_URL}/miniapp-icon.png`;
const MINIAPP_SPLASH_URL = `${APP_URL}/miniapp-splash.png`;

/** Verified domain association for boombox-one.vercel.app (fid 770246) */
const DEFAULT_ACCOUNT_ASSOCIATION = {
  header:
    "eyJmaWQiOjc3MDI0NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDJkMzNiRjAxRTRCYThENmJlMzZENkE5N2JCODQ2ZjcyNTFmRWIxMUQifQ",
  payload: "eyJkb21haW4iOiJib29tYm94LW9uZS52ZXJjZWwuYXBwIn0",
  signature:
    "SqoASYuAz9lSNHdqiw0CDTDGkf6cPaAiKq8iwqWe38wpDIgtZf0iZxBIsv4+ZgtzQp/X0TpvfJLSvB4TTHr07hw=",
} as const;

function buildMiniAppConfig() {
  return {
    version: "1",
    name: "Boombox",
    iconUrl: MINIAPP_ICON_URL,
    homeUrl: APP_URL,
    imageUrl: `${APP_URL}/image.png`,
    buttonTitle: "Play Boombox",
    splashImageUrl: MINIAPP_SPLASH_URL,
    splashBackgroundColor: "#050508",
    webhookUrl: `${APP_URL}/api/webhook`,
    subtitle: "Whack Warplets on Base",
    description:
      "Hit Warplets, bank BOOM on Base Mainnet, cash out or risk the next level. One shot per stage.",
    primaryCategory: "games",
    tags: ["base", "game", "warplet", "boombox", "onchain"],
    heroImageUrl: `${APP_URL}/image.png`,
    tagline: "Risk it on Base",
    ogTitle: "Boombox",
    ogDescription: "Cosmic Whack a Mole mini game on Base Mainnet.",
    ogImageUrl: `${APP_URL}/image.png`,
    screenshotUrls: [
      `${APP_URL}/screenshot-1.png`,
      `${APP_URL}/screenshot-2.png`,
      `${APP_URL}/screenshot-3.png`,
    ],
    requiredChains: ["eip155:8453"],
    requiredCapabilities: ["wallet.getEthereumProvider"],
  };
}

function buildAccountAssociation() {
  const header =
    process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER ??
    DEFAULT_ACCOUNT_ASSOCIATION.header;
  const payload =
    process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD ??
    DEFAULT_ACCOUNT_ASSOCIATION.payload;
  const signature =
    process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE ??
    DEFAULT_ACCOUNT_ASSOCIATION.signature;

  return { header, payload, signature };
}

export function buildFarcasterManifest() {
  const miniapp = buildMiniAppConfig();

  return {
    accountAssociation: buildAccountAssociation(),
    miniapp,
    frame: miniapp,
  };
}

/** Embed meta for casts / link previews */
export function buildMiniAppEmbedMeta() {
  return {
    version: "1",
    imageUrl: `${APP_URL}/image.png`,
    button: {
      title: "Play Boombox",
      action: {
        type: "launch_miniapp",
        name: "Boombox",
        url: APP_URL,
        splashImageUrl: MINIAPP_SPLASH_URL,
        splashBackgroundColor: "#050508",
      },
    },
  };
}
