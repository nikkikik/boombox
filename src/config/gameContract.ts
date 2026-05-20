import { boomboxGameAbi, boomboxTokenAbi } from "@/contracts/abi";

export const GAME_CONTRACT_ADDRESS = (process.env
  .NEXT_PUBLIC_GAME_CONTRACT_ADDRESS ?? "") as `0x${string}`;

export const BOOM_TOKEN_ADDRESS = (process.env
  .NEXT_PUBLIC_BOOM_TOKEN_ADDRESS ?? "") as `0x${string}`;

export const isGameContractConfigured =
  GAME_CONTRACT_ADDRESS.length === 42 &&
  GAME_CONTRACT_ADDRESS.startsWith("0x");

export const isBoomTokenConfigured =
  BOOM_TOKEN_ADDRESS.length === 42 && BOOM_TOKEN_ADDRESS.startsWith("0x");

export const isOnChainEnabled = isGameContractConfigured && isBoomTokenConfigured;

export { boomboxGameAbi, boomboxTokenAbi };

export const gameContractAbi = boomboxGameAbi;
