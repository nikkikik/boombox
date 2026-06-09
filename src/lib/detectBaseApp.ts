/** True when running inside the Base mobile app in-app browser */
export function isBaseApp(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("baseapp") || ua.includes("base/")) return true;

  const eth = (window as Window & { ethereum?: { isBase?: boolean; isCoinbaseWallet?: boolean } })
    .ethereum;

  return Boolean(eth?.isBase || eth?.isCoinbaseWallet);
}
