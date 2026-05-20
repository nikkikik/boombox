"use client";

import { useEffect } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { appChain } from "@/config/wagmi";
import {
  SCORE_CONTRACT_ADDRESS,
  gameScoreAbi,
  getExplorerTxUrl,
  isScoreContractConfigured,
  appChainId,
} from "@/config/gameScore";

interface SaveOnBaseProps {
  totalPoints: number;
  onStatus: (message: string) => void;
}

export function SaveOnBase({ totalPoints, onStatus }: SaveOnBaseProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: hash, isPending, writeContract, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess && hash) {
      onStatus(`Saved on ${appChain.name}!`);
    }
  }, [isSuccess, hash, onStatus]);

  useEffect(() => {
    if (error) {
      onStatus(error.message.slice(0, 80));
    }
  }, [error, onStatus]);

  if (!isConnected) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-1 text-center text-[10px] text-slate-500"
      >
        Save on Base (connect wallet)
      </button>
    );
  }

  if (chainId !== appChainId) {
    return (
      <button
        type="button"
        onClick={() => switchChain({ chainId: appChainId })}
        disabled={isSwitching}
        className="w-full py-1.5 text-center text-[10px] text-cyan-300 underline"
      >
        {isSwitching ? "Switching…" : `Switch to ${appChain.name}`}
      </button>
    );
  }

  if (!isScoreContractConfigured) {
    return (
      <button
        type="button"
        onClick={() =>
          onStatus(
            `Deploy BoomboxScore.sol on ${appChain.name} and set NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS`
          )
        }
        className="w-full py-1.5 text-center text-[10px] text-cyan-300/80 underline"
      >
        Save on Base (set contract)
      </button>
    );
  }

  const scoreWei = BigInt(Math.floor(totalPoints * 10));

  return (
    <div className="flex flex-1 flex-col gap-1">
      <button
        type="button"
        disabled={isPending || isConfirming}
        onClick={() =>
          writeContract({
            address: SCORE_CONTRACT_ADDRESS,
            abi: gameScoreAbi,
            functionName: "saveScore",
            args: [scoreWei],
            chainId: appChainId,
          })
        }
        className="w-full py-1.5 text-center text-[10px] font-semibold text-cyan-300/90 disabled:opacity-50"
      >
        {isPending
          ? "Confirm in wallet…"
          : isConfirming
            ? "Confirming…"
            : "Save on Base"}
      </button>
      {hash && (
        <a
          href={getExplorerTxUrl(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-[10px] text-cyan-400 underline"
        >
          View on Basescan
        </a>
      )}
    </div>
  );
}
