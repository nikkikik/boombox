import { base } from "wagmi/chains";
import { appChain } from "./wagmi";

/**
 * Deploy BoomboxScore.sol to Base Sepolia and set the address in .env.local
 * See contracts/BoomboxScore.sol and README for Foundry deploy steps.
 */
export const SCORE_CONTRACT_ADDRESS = (process.env
  .NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS ?? "") as `0x${string}`;

export const isScoreContractConfigured =
  SCORE_CONTRACT_ADDRESS.length === 42 &&
  SCORE_CONTRACT_ADDRESS.startsWith("0x");

export const gameScoreAbi = [
  {
    type: "function",
    name: "saveScore",
    inputs: [{ name: "score", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "scores",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const appChainId = appChain.id;

export function getExplorerTxUrl(hash: string): string {
  const baseUrl =
    appChain.id === base.id
      ? "https://basescan.org"
      : "https://sepolia.basescan.org";
  return `${baseUrl}/tx/${hash}`;
}
