import { APP_URL } from "@/constants/appUrl";

export function buildFarcasterManifest() {
  const accountAssociation = buildAccountAssociation();

  return {
    ...(accountAssociation ? { accountAssociation } : {}),
    miniapp: {
      version: "1",
      name: "Boombox Warplet",
      iconUrl: `${APP_URL}/icon`,
      homeUrl: APP_URL,
      splashImageUrl: `${APP_URL}/splash`,
      splashBackgroundColor: "#050508",
      subtitle: "Whack-a-Mole on Base",
      description:
        "Hit Warplets, bank $BOOM on Base Mainnet, cash out or risk the next level. One shot per stage.",
      primaryCategory: "games",
      tags: ["base", "game", "warplet", "boombox", "onchain"],
      heroImageUrl: `${APP_URL}/opengraph-image`,
      tagline: "Risk it on Base",
      ogTitle: "Boombox Warplet",
      ogDescription: "Cosmic Whack-a-Mole mini-game on Base Mainnet.",
      ogImageUrl: `${APP_URL}/opengraph-image`,
      buttonTitle: "Play",
      requiredChains: ["eip155:8453"],
      requiredCapabilities: ["wallet.getEthereumProvider"],
    },
  };
}

function buildAccountAssociation() {
  const header = process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER;
  const payload = process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD;
  const signature = process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE;

  if (!header || !payload || !signature) return null;

  return { header, payload, signature };
}

/** Embed meta for casts / link previews */
export function buildMiniAppEmbedMeta() {
  return {
    version: "1",
    imageUrl: `${APP_URL}/opengraph-image`,
    button: {
      title: "Play Boombox",
      action: {
        type: "launch_miniapp",
        name: "Boombox Warplet",
        url: APP_URL,
        splashImageUrl: `${APP_URL}/splash`,
        splashBackgroundColor: "#050508",
      },
    },
  };
}
