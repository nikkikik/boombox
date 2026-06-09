import { http, createConfig, createStorage } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { BUILDER_DATA_SUFFIX } from "@/lib/builderCode";

/** Production chain: Base Mainnet only */
export const appChain = base;

export const SWITCH_TO_BASE_MAINNET_MESSAGE =
  "Switch to Base Mainnet to play";

/** SSR stub — full Storage shape for TypeScript / wagmi */
const serverStorage = {
  get length() {
    return 0;
  },
  clear() {},
  getItem() {
    return null;
  },
  key() {
    return null;
  },
  removeItem() {},
  setItem() {},
} satisfies Storage;

/** localStorage on client; cookieStorage + SSR traps mobile in "reconnecting" */
const wagmiStorage = createStorage({
  storage:
    typeof window !== "undefined" ? window.localStorage : serverStorage,
});

export const config = createConfig({
  chains: [base],
  /** Avoid EIP-6963 duplicates with baseAccount inside Base app */
  multiInjectedProviderDiscovery: false,
  connectors: [
    baseAccount({
      appName: "Boombox Warplet",
    }),
    farcasterMiniApp(),
    injected(),
  ],
  storage: wagmiStorage,
  ssr: true,
  /** Base Builder Code attribution on supported wallet flows */
  dataSuffix: BUILDER_DATA_SUFFIX,
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
