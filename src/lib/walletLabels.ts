import type { Connector } from "wagmi";

export function getWalletOptionLabel(connector: Connector): string {
  switch (connector.id) {
    case "baseAccount":
    case "coinbaseWalletSDK":
      return "Base Smart Wallet";
    case "injected":
      return "Browser Wallet (MetaMask…)";
    case "farcaster":
    case "farcasterMiniApp":
      return "Farcaster Wallet";
    default:
      return connector.name;
  }
}

export function getWalletOptionDescription(connector: Connector): string {
  switch (connector.id) {
    case "baseAccount":
    case "coinbaseWalletSDK":
      return "Smart wallet on Base — gasless & batch txs";
    case "injected":
      return "Extension wallet in your browser";
    case "farcaster":
    case "farcasterMiniApp":
      return "Wallet inside Warpcast / Farcaster app";
    default:
      return "Connect with " + connector.name;
  }
}
