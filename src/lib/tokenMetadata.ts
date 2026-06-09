import { APP_URL } from "@/constants/appUrl";
import { BOOM_TOKEN_ADDRESS } from "@/constants/addresses";

/** Public logo for $BOOM — use when submitting to BaseScan token update */
export const BOOM_TOKEN_LOGO_URL = `${APP_URL}/boom-token.png`;

export const BOOM_TOKEN_METADATA = {
  name: "Boombox",
  symbol: "BOOM",
  decimals: 18,
  chainId: 8453,
  address: BOOM_TOKEN_ADDRESS,
  logoURI: BOOM_TOKEN_LOGO_URL,
} as const;
