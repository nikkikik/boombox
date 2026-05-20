import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

/** Primary chain for development (Base Sepolia). Set NEXT_PUBLIC_USE_MAINNET=true for Base mainnet. */
export const appChain =
  process.env.NEXT_PUBLIC_USE_MAINNET === "true" ? base : baseSepolia;

export const config = createConfig({
  chains: [appChain, base, baseSepolia],
  connectors: [
    baseAccount({
      appName: "Boombox Warplet",
    }),
    farcasterMiniApp(),
    injected(),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http("https://mainnet.base.org"),
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ??
        "https://sepolia.base.org"
    ),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
