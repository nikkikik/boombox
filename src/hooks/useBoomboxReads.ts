"use client";

import { useAccount, useReadContract } from "wagmi";
import {
  BOOM_TOKEN_ADDRESS,
  GAME_CONTRACT_ADDRESS,
  boomboxGameAbi,
  boomboxTokenAbi,
  isOnChainEnabled,
} from "@/config/gameContract";
import { SWITCH_TO_BASE_MAINNET_MESSAGE, appChain } from "@/config/wagmi";
import {
  boomWeiToNumber,
  parsePlayerTuple,
  type ChainPlayerState,
} from "@/lib/onchainGame";

const BALANCE_REFETCH_MS = 3000;

export function useBoomboxReads() {
  const { address: walletAddress, isConnected, chainId } = useAccount();
  const enabled = isOnChainEnabled && isConnected && !!walletAddress;
  const isWrongChain =
    isConnected && chainId !== undefined && chainId !== appChain.id;

  const {
    data: boomBalanceWei,
    refetch: refetchBalance,
    isFetching: isBalanceFetching,
    isError: isBalanceError,
  } = useReadContract({
    address: BOOM_TOKEN_ADDRESS,
    abi: boomboxTokenAbi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    chainId: appChain.id,
    query: {
      enabled: isOnChainEnabled && !!walletAddress,
      refetchInterval: BALANCE_REFETCH_MS,
      staleTime: 0,
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
    args: walletAddress ? [walletAddress] : undefined,
    chainId: appChain.id,
    query: {
      enabled,
      refetchInterval: BALANCE_REFETCH_MS,
    },
  });

  const player: ChainPlayerState | null = parsePlayerTuple(
    playerRaw as readonly [number, number, bigint, bigint, bigint] | undefined
  );

  const boomBalance =
    walletAddress === undefined
      ? 0
      : boomBalanceWei !== undefined
        ? boomWeiToNumber(boomBalanceWei as bigint)
        : 0;

  const fetchPlayer = async () => {
    const result = await refetchPlayer();
    return parsePlayerTuple(
      result.data as readonly [number, number, bigint, bigint, bigint] | undefined
    );
  };

  return {
    isOnChain: isOnChainEnabled,
    address: walletAddress,
    isConnected,
    chainId,
    isWrongChain,
    appChainName: "Base Mainnet",
    switchNetworkMessage: SWITCH_TO_BASE_MAINNET_MESSAGE,
    player,
    boomBalance,
    isBalanceLoading:
      isOnChainEnabled && !!walletAddress && boomBalanceWei === undefined,
    isBalanceFetching,
    isBalanceError,
    canDailyCheckIn: false,
    canDailyCheckInUnavailable: true,
    isPlayerLoading: enabled && !isPlayerFetched,
    refetchBalance,
    refetchPlayer: fetchPlayer,
    refetchAll: async () => {
      await Promise.all([refetchBalance(), refetchPlayer()]);
    },
  };
}
