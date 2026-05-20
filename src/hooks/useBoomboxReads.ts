"use client";

import { useAccount, useReadContract } from "wagmi";
import {
  BOOM_TOKEN_ADDRESS,
  GAME_CONTRACT_ADDRESS,
  boomboxGameAbi,
  boomboxTokenAbi,
  isOnChainEnabled,
} from "@/config/gameContract";
import {
  boomWeiToNumber,
  parsePlayerTuple,
  type ChainPlayerState,
} from "@/lib/onchainGame";

export function useBoomboxReads() {
  const { address, isConnected } = useAccount();
  const enabled = isOnChainEnabled && isConnected && !!address;

  const { data: boomBalanceWei, refetch: refetchBalance } = useReadContract({
    address: BOOM_TOKEN_ADDRESS,
    abi: boomboxTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const { data: playerRaw, refetch: refetchPlayer } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: boomboxGameAbi,
    functionName: "players",
    args: address ? [address] : undefined,
    query: { enabled, refetchInterval: false },
  });

  const { data: canCheckIn } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: boomboxGameAbi,
    functionName: "canDailyCheckIn",
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const player: ChainPlayerState | null = parsePlayerTuple(
    playerRaw as readonly [number, number, bigint, bigint, bigint] | undefined
  );

  const boomBalance =
    boomBalanceWei !== undefined ? boomWeiToNumber(boomBalanceWei as bigint) : 0;

  const fetchPlayer = async () => {
    const result = await refetchPlayer();
    return parsePlayerTuple(
      result.data as readonly [number, number, bigint, bigint, bigint] | undefined
    );
  };

  return {
    isOnChain: isOnChainEnabled,
    address,
    isConnected,
    player,
    boomBalance,
    canDailyCheckIn: canCheckIn === true,
    refetchBalance,
    refetchPlayer: fetchPlayer,
    refetchAll: async () => {
      await Promise.all([refetchBalance(), refetchPlayer()]);
    },
  };
}
