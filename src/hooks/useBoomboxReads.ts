"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient, useReadContract, useWatchBlockNumber } from "wagmi";
import {
  BOOM_TOKEN_ADDRESS,
  GAME_CONTRACT_ADDRESS,
  boomboxGameAbi,
  boomboxTokenAbi,
  isOnChainEnabled,
} from "@/config/gameContract";
import { appChain } from "@/config/wagmi";
import {
  boomWeiToNumber,
  parsePlayerTuple,
  type ChainPlayerState,
} from "@/lib/onchainGame";

export const boomBalanceQueryKey = (address?: `0x${string}`) =>
  ["boom", "balanceOf", BOOM_TOKEN_ADDRESS, address] as const;

export function useBoomboxReads() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: appChain.id });
  const enabled = isOnChainEnabled && isConnected && !!address;

  const {
    data: boomBalanceWei,
    refetch: refetchBalance,
    isFetching: isBalanceFetching,
  } = useQuery({
    queryKey: boomBalanceQueryKey(address),
    enabled: enabled && !!publicClient && !!address,
    staleTime: 0,
    queryFn: async () => {
      if (!publicClient || !address) return BigInt(0);
      return publicClient.readContract({
        address: BOOM_TOKEN_ADDRESS,
        abi: boomboxTokenAbi,
        functionName: "balanceOf",
        args: [address],
      });
    },
  });

  useWatchBlockNumber({
    chainId: appChain.id,
    enabled,
    onBlockNumber: () => {
      void refetchBalance();
    },
  });

  const {
    data: playerRaw,
    refetch: refetchPlayer,
    isFetched: isPlayerFetched,
  } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: boomboxGameAbi,
    functionName: "players",
    args: address ? [address] : undefined,
    query: { enabled, refetchInterval: false },
  });

  const {
    data: canCheckIn,
    isError: canCheckInUnavailable,
    refetch: refetchCanCheckIn,
  } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: boomboxGameAbi,
    functionName: "canDailyCheckIn",
    args: address ? [address] : undefined,
    query: { enabled, retry: false },
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
    isBalanceFetching,
    canDailyCheckIn: canCheckIn === true,
    canDailyCheckInUnavailable: canCheckInUnavailable,
    isPlayerLoading: enabled && !isPlayerFetched,
    refetchBalance,
    refetchPlayer: fetchPlayer,
    refetchAll: async () => {
      await Promise.all([
        refetchBalance(),
        refetchPlayer(),
        refetchCanCheckIn(),
      ]);
    },
  };
}
