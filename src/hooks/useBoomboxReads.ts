"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWatchBlockNumber,
} from "wagmi";
import { formatEther } from "viem";
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
  ["boom", "balanceOf", BOOM_TOKEN_ADDRESS, address, appChain.id] as const;

export function useBoomboxReads() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: appChain.id });
  const enabled = isOnChainEnabled && isConnected && !!address;
  const isWrongChain =
    isConnected && chainId !== undefined && chainId !== appChain.id;

  const {
    data: wagmiBalance,
    isLoading: isBalanceLoading,
    isFetching: isBalanceFetching,
    isError: isBalanceError,
    refetch: refetchWagmiBalance,
  } = useBalance({
    address,
    token: BOOM_TOKEN_ADDRESS,
    chainId: appChain.id,
    query: {
      enabled,
      staleTime: 0,
    },
  });

  const {
    data: boomBalanceWei,
    refetch: refetchBalanceQuery,
    isFetching: isQueryFetching,
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

  const refetchBalance = async () => {
    await Promise.all([refetchWagmiBalance(), refetchBalanceQuery()]);
  };

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

  const balanceWei =
    wagmiBalance?.value ?? (boomBalanceWei as bigint | undefined) ?? undefined;

  const boomBalance =
    balanceWei !== undefined ? boomWeiToNumber(balanceWei) : undefined;

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
    chainId,
    isWrongChain,
    appChainName: appChain.name,
    player,
    boomBalance: boomBalance ?? 0,
    boomBalanceFormatted:
      boomBalance !== undefined
        ? boomBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })
        : null,
    isBalanceLoading: enabled && (isBalanceLoading || boomBalance === undefined),
    isBalanceFetching: isBalanceFetching || isQueryFetching,
    isBalanceError,
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
    /** Debug: raw wei from RPC */
    boomBalanceWei: balanceWei,
    boomBalanceEther: balanceWei !== undefined ? formatEther(balanceWei) : null,
  };
}
