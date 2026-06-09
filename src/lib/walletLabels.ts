import type { Connector } from "wagmi";
import { connectorDedupeKey } from "@/lib/walletConnectors";

export function getWalletOptionLabel(connector: Connector): string {
  if (connectorDedupeKey(connector) === "base") {
    return "Base Smart Wallet";
  }

  switch (connector.id) {
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
  if (connectorDedupeKey(connector) === "base") {
    return "Smart wallet on Base — gasless & batch txs";
  }

  switch (connector.id) {
    case "injected":
      return "Extension wallet in your browser";
    case "farcaster":
    case "farcasterMiniApp":
      return "Wallet inside Warpcast / Farcaster app";
    default:
      return "Connect with " + connector.name;
  }
}
