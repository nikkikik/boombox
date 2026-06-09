import { Attribution } from "ox/erc8021";

/** Base Builder Code from base.dev → Settings → Builder Codes */
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BUILDER_CODE ?? "bc_8btj5ztw";

/** ERC-8021 hex suffix appended to transaction calldata for Base attribution */
export const BUILDER_DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
}) as `0x${string}`;

/** For wallet_sendCalls / ERC-5792 dataSuffix capability */
export const BUILDER_DATA_SUFFIX_CAPABILITY = {
  value: BUILDER_DATA_SUFFIX,
  optional: true,
} as const;
