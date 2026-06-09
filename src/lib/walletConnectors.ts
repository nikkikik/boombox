import type { Connector } from "wagmi";

const PREFERRED_CONNECTOR_ORDER = [
  "baseAccount",
  "coinbaseWalletSDK",
  "farcasterMiniApp",
  "farcaster",
  "injected",
] as const;

function isBaseWallet(connector: Connector): boolean {
  const name = connector.name.toLowerCase();
  return (
    connector.id === "baseAccount" ||
    connector.id === "coinbaseWalletSDK" ||
    /base account|base smart|coinbase wallet|^base$/.test(name)
  );
}

/** Collapse Base app duplicates (baseAccount + injected "Base") into one option */
export function connectorDedupeKey(connector: Connector): string {
  if (isBaseWallet(connector)) return "base";
  if (connector.id === "farcaster" || connector.id === "farcasterMiniApp") {
    return "farcaster";
  }
  if (connector.id === "injected") return "browser-injected";
  return connector.id;
}

export function dedupeWalletConnectors(connectors: readonly Connector[]): Connector[] {
  const seen = new Set<string>();
  const sorted = [...connectors].sort((a, b) => {
    const ai = PREFERRED_CONNECTOR_ORDER.indexOf(
      a.id as (typeof PREFERRED_CONNECTOR_ORDER)[number]
    );
    const bi = PREFERRED_CONNECTOR_ORDER.indexOf(
      b.id as (typeof PREFERRED_CONNECTOR_ORDER)[number]
    );
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return sorted.filter((connector) => {
    const key = connectorDedupeKey(connector);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
