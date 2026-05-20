import { boomboxGameAbi, boomboxTokenAbi } from "@/contracts/abi";
import {
  BOOM_TOKEN_ADDRESS,
  GAME_CONTRACT_ADDRESS,
} from "@/constants/addresses";

export { BOOM_TOKEN_ADDRESS, GAME_CONTRACT_ADDRESS };

/** Contracts are always configured via src/constants/addresses.ts */
export const isOnChainEnabled = true;

export { boomboxGameAbi, boomboxTokenAbi };

export const gameContractAbi = boomboxGameAbi;
