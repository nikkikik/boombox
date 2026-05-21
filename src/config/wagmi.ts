import { http, createConfig, createStorage, noopStorage } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

/** Production chain: Base Mainnet only */
export const appChain = base;

export const SWITCH_TO_BASE_MAINNET_MESSAGE =
  "Switch to Base Mainnet to play";

/** cookieStorage + SSR often leaves mobile browsers stuck in "reconnecting" */
function wagmiStorage() {
  if (typeof window === "undefined") return noopStorage;
  return createStorage({ storage: window.localStorage });
}

export const config = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: "Boombox Warplet",
    }),
    farcasterMiniApp(),
    injected(),
  ],
  storage: wagmiStorage(),
  ssr: true,
  transports: {
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL ?? "https://mainnet.base.org"
    ),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
