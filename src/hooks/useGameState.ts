"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  INITIAL_MULTIPLIER,
  TOTAL_HOLES,
  WarpletConfig,
  getLevelChance,
  getStageName,
  pickWarpletType,
} from "@/lib/gameConfig";
import {
  CHAIN_STATUS,
  boomWeiToNumber,
  chainStatusToPhase,
  hitChanceForChainLevel,
  multiplierForLevel,
  rewardBoomForLevel,
  rewardWeiForLevel,
} from "@/lib/onchainGame";
import { SWITCH_TO_BASE_MAINNET_MESSAGE } from "@/config/wagmi";
import { useBoomboxReads } from "./useBoomboxReads";
import { useDailyCheckIn } from "./useDailyCheckIn";
import { useGameTransactions } from "./useGameTransactions";

export type GamePhase =
  | "WAITING_FOR_TX"
  | "PLAYING"
  | "CHOOSING_REWARD"
  | "GAME_OVER";

export type WarpletAnimState = "active" | "vibrate" | "explode" | "gone";

export interface ActiveWarplet {
  holeIndex: number;
  config: WarpletConfig;
  visible: boolean;
  animState: WarpletAnimState;
}

export interface GameState {
  phase: GamePhase;
  level: number;
  multiplier: number;
  roundPoints: number;
  hasAttempt: boolean;
  activeWarplets: ActiveWarplet[];
  lastResult: string | null;
  soundOn: boolean;
}

const SPAWN_INTERVAL_MS = 900;
const WARPLET_VISIBLE_MS = 2200;
const EXPLODE_MS = 650;

function randomHoleIndex(exclude: number[]): number {
  const available = Array.from({ length: TOTAL_HOLES }, (_, i) => i).filter(
    (i) => !exclude.includes(i)
  );
  if (available.length === 0) return Math.floor(Math.random() * TOTAL_HOLES);
  return available[Math.floor(Math.random() * available.length)];
}

function playingSnapshot(level: number) {
  return {
    phase: "PLAYING" as GamePhase,
    level,
    multiplier: multiplierForLevel(level),
    hasAttempt: true,
    activeWarplets: [] as ActiveWarplet[],
    lastResult: `Level ${level} — one shot! Hit chance ${getLevelChance(level)}%`,
  };
}

export function useGameState() {
  const chain = useBoomboxReads();
  const tx = useGameTransactions({
    refetchBalance: chain.refetchBalance,
    refetchAfterDailyCheckIn: chain.refetchAll,
  });
  const daily = useDailyCheckIn(chain, tx);

  const [state, setState] = useState<GameState>({
    phase: "WAITING_FOR_TX",
    level: 0,
    multiplier: INITIAL_MULTIPLIER,
    roundPoints: 0,
    hasAttempt: false,
    activeWarplets: [],
    lastResult: `Connect wallet & start on ${chain.appChainName}`,
    soundOn: true,
  });

  const [isWhackResolving, setIsWhackResolving] = useState(false);
  const spawnTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const localSessionRef = useRef(false);

  const clearSpawnTimers = useCallback(() => {
    spawnTimers.current.forEach((t) => clearTimeout(t));
    spawnTimers.current.clear();
  }, []);

  const scheduleTimer = useCallback((key: string, fn: () => void, ms: number) => {
    const existing = spawnTimers.current.get(key);
    if (existing) clearTimeout(existing);
    const t = setTimeout(fn, ms);
    spawnTimers.current.set(key, t);
  }, []);

  const syncFromChain = useCallback(
    (opts?: { force?: boolean }) => {
      const p = chain.player;
      if (!p || !chain.isOnChain) return;

      const isActiveOnChain =
        p.status === CHAIN_STATUS.Playing ||
        p.status === CHAIN_STATUS.Choosing;

      if (isActiveOnChain && !localSessionRef.current && !opts?.force) {
        setState((s) => ({
          ...s,
          phase: "WAITING_FOR_TX",
          level: 0,
          roundPoints: 0,
          hasAttempt: false,
          activeWarplets: [],
          lastResult:
            "Tap Start game — closes any stale on-chain run, then begins Level 1",
        }));
        return;
      }

      const phase = chainStatusToPhase(p.status);
      const roundPoints = boomWeiToNumber(p.potentialReward);
      const level = p.level;

      setState((s) => ({
        ...s,
        phase,
        level,
        multiplier: multiplierForLevel(level),
        roundPoints,
        hasAttempt: p.status === CHAIN_STATUS.Playing,
        ...(phase !== "PLAYING" ? { activeWarplets: [] } : {}),
      }));
    },
    [chain.player, chain.isOnChain]
  );

  useEffect(() => {
    if (!chain.isOnChain || !chain.player) return;
    if (localSessionRef.current) {
      syncFromChain({ force: true });
      return;
    }
    if (
      chain.player.status === CHAIN_STATUS.Idle ||
      chain.player.status === CHAIN_STATUS.GameOver
    ) {
      syncFromChain({ force: true });
    } else {
      syncFromChain();
    }
  }, [chain.player, chain.isOnChain, syncFromChain]);

  useEffect(() => {
    if (!chain.isConnected || chain.isWrongChain) return;
    setState((s) => {
      if (s.phase !== "WAITING_FOR_TX") return s;
      if (!s.lastResult?.includes("Connect wallet")) return s;
      return {
        ...s,
        lastResult: "Tap Start game on Base Mainnet",
      };
    });
  }, [chain.isConnected, chain.isWrongChain]);

  const spawnWarplet = useCallback(() => {
    setState((s) => {
      if (s.phase !== "PLAYING" || !s.hasAttempt || isWhackResolving || tx.isPending) {
        return s;
      }
      const occupied = s.activeWarplets.filter((w) => w.visible).map((w) => w.holeIndex);
      if (occupied.length >= TOTAL_HOLES) return s;
      const holeIndex = randomHoleIndex(occupied);
      const config = pickWarpletType();
      scheduleTimer(`hide-${holeIndex}`, () => {
        setState((prev) => ({
          ...prev,
          activeWarplets: prev.activeWarplets.filter(
            (w) => !(w.holeIndex === holeIndex && w.animState === "active")
          ),
        }));
      }, WARPLET_VISIBLE_MS);
      const filtered = s.activeWarplets.filter((w) => w.holeIndex !== holeIndex);
      return {
        ...s,
        activeWarplets: [
          ...filtered,
          { holeIndex, config, visible: true, animState: "active" },
        ],
      };
    });
  }, [scheduleTimer, isWhackResolving, tx.isPending]);

  useEffect(() => {
    if (state.phase !== "PLAYING" || !state.hasAttempt) return;
    spawnWarplet();
    const interval = setInterval(spawnWarplet, SPAWN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state.phase, state.hasAttempt, spawnWarplet]);

  useEffect(() => () => clearSpawnTimers(), [clearSpawnTimers]);

  const startGame = useCallback(async (): Promise<boolean> => {
    if (!tx.isConnected) {
      setState((s) => ({ ...s, lastResult: "Connect wallet to start" }));
      return false;
    }
    if (chain.isWrongChain) {
      setState((s) => ({
        ...s,
        lastResult: SWITCH_TO_BASE_MAINNET_MESSAGE,
      }));
      return false;
    }

    setState((s) => ({
      ...s,
      phase: "WAITING_FOR_TX",
      lastResult: "Confirm startGame in wallet…",
    }));

    if (tx.isOnChain && chain.player?.status === CHAIN_STATUS.Playing) {
      setState((s) => ({
        ...s,
        lastResult: "Closing previous run on Base…",
      }));
      const close = await tx.forfeitRun();
      if (!close.ok) {
        setState((s) => ({
          ...s,
          phase: "GAME_OVER",
          lastResult: tx.error?.message?.slice(0, 80) ?? "Submit cancelled",
        }));
        return false;
      }
      await chain.refetchAll();
    }

    const { ok, hash } = await tx.startGame();
    if (!ok) {
      setState((s) => ({
        ...s,
        phase: "WAITING_FOR_TX",
        lastResult: tx.error?.message?.slice(0, 80) ?? "Transaction cancelled",
      }));
      return false;
    }

    clearSpawnTimers();
    localSessionRef.current = true;
    await chain.refetchAll();

    setState((s) => ({
      ...s,
      ...playingSnapshot(1),
      roundPoints: 0,
      lastResult: hash
        ? `Game started · ${hash.slice(0, 10)}…`
        : "Level 1 — good luck!",
    }));
    return true;
  }, [tx, chain, clearSpawnTimers]);

  const whack = useCallback(
    async (holeIndex: number): Promise<"hit" | "miss" | "noop"> => {
      if (
        state.phase !== "PLAYING" ||
        !state.hasAttempt ||
        isWhackResolving ||
        tx.isPending
      ) {
        return "noop";
      }

      const warplet = state.activeWarplets.find(
        (w) =>
          w.holeIndex === holeIndex &&
          w.visible &&
          w.animState === "active"
      );

      if (!warplet) {
        setState((s) => ({
          ...s,
          lastResult: "No Warplet here — wait for one to pop up!",
        }));
        return "noop";
      }

      setIsWhackResolving(true);
      setState((s) => ({
        ...s,
        hasAttempt: false,
        lastResult: "Resolving…",
      }));
      clearSpawnTimers();

      const hideKey = `hide-${holeIndex}`;
      const hideT = spawnTimers.current.get(hideKey);
      if (hideT) clearTimeout(hideT);
      spawnTimers.current.delete(hideKey);

      const chance = getLevelChance(state.level);
      const success = Math.random() * 100 < chance;
      const earned = rewardBoomForLevel(state.level);

      if (!success) {
        scheduleTimer("vibrate-miss", () => {
          setState((s) => ({
            ...s,
            activeWarplets: s.activeWarplets.map((w) =>
              w.holeIndex === holeIndex
                ? { ...w, animState: "vibrate" as WarpletAnimState }
                : w
            ),
          }));
        }, 0);

        scheduleTimer("gameover-miss", () => {
          localSessionRef.current = false;
          setIsWhackResolving(false);
          setState((s) => ({
            ...s,
            phase: "GAME_OVER",
            level: 0,
            roundPoints: 0,
            activeWarplets: [],
            lastResult: "Miss! Run over — start again",
          }));
        }, 480);
        return "miss";
      }

      const newBank = state.roundPoints + earned;
      setState((s) => ({
        ...s,
        phase: "CHOOSING_REWARD",
        roundPoints: newBank,
        activeWarplets: s.activeWarplets.map((w) =>
          w.holeIndex === holeIndex
            ? { ...w, animState: "explode" as WarpletAnimState }
            : w
        ),
        lastResult: `Hit! +${earned} $BOOM (${newBank.toFixed(0)} banked) — cash out or next level?`,
      }));
      scheduleTimer(`explode-${holeIndex}`, () => {
        setState((prev) => ({
          ...prev,
          activeWarplets: prev.activeWarplets.filter(
            (w) => w.holeIndex !== holeIndex
          ),
        }));
      }, EXPLODE_MS);
      setIsWhackResolving(false);
      return "hit";
    },
    [
      state.phase,
      state.hasAttempt,
      state.activeWarplets,
      state.level,
      state.roundPoints,
      isWhackResolving,
      tx,
      clearSpawnTimers,
      scheduleTimer,
    ]
  );

  const cashOut = useCallback(async (): Promise<boolean> => {
    if (state.phase !== "CHOOSING_REWARD") return false;
    if (chain.isWrongChain) {
      setState((s) => ({ ...s, lastResult: SWITCH_TO_BASE_MAINNET_MESSAGE }));
      return false;
    }
    if (!tx.isConnected) {
      setState((s) => ({ ...s, lastResult: "Connect wallet to cash out" }));
      return false;
    }

    const payout = state.roundPoints;
    const rewardWei = rewardWeiForLevel(state.level);

    setState((s) => ({
      ...s,
      lastResult: "Confirm cashOut on Base…",
    }));

    const { ok, hash } = await tx.cashOut(true, rewardWei);
    if (!ok) {
      setState((s) => ({
        ...s,
        lastResult: tx.error?.message?.slice(0, 80) ?? "Cash out cancelled",
      }));
      return false;
    }

    clearSpawnTimers();
    localSessionRef.current = false;
    await chain.refetchBalance();
    await chain.refetchAll();
    syncFromChain();

    setState((s) => ({
      ...s,
      phase: "WAITING_FOR_TX",
      level: 0,
      roundPoints: 0,
      hasAttempt: false,
      activeWarplets: [],
      lastResult: hash
        ? `Claimed ${payout.toFixed(0)} $BOOM · ${hash.slice(0, 10)}…`
        : `Claimed ${payout.toFixed(0)} $BOOM!`,
    }));
    return true;
  }, [
    state.phase,
    state.roundPoints,
    state.level,
    tx,
    chain,
    clearSpawnTimers,
    syncFromChain,
  ]);

  const goToNextLevel = useCallback(async () => {
    if (state.phase !== "CHOOSING_REWARD") return;
    if (chain.isWrongChain) {
      setState((s) => ({ ...s, lastResult: SWITCH_TO_BASE_MAINNET_MESSAGE }));
      return;
    }

    const rewardWei = rewardWeiForLevel(state.level);
    const nextLevel = state.level + 1;

    if (tx.isOnChain) {
      setState((s) => ({
        ...s,
        lastResult: "Confirm nextLevel on Base…",
      }));
      const { ok } = await tx.nextLevel(true, rewardWei);
      if (!ok) {
        setState((s) => ({
          ...s,
          lastResult: tx.error?.message?.slice(0, 80) ?? "Next level cancelled",
        }));
        return;
      }
      await chain.refetchAll();
      const bank = chain.player ? boomWeiToNumber(chain.player.potentialReward) : state.roundPoints;
      setState((s) => ({
        ...s,
        ...playingSnapshot(nextLevel),
        roundPoints: bank,
        lastResult: `Level ${nextLevel} — hit chance ${hitChanceForChainLevel(nextLevel)}%`,
      }));
      return;
    }

    clearSpawnTimers();
    setState((s) => ({
      ...s,
      ...playingSnapshot(nextLevel),
      lastResult: `Level ${nextLevel} — hit chance ${getLevelChance(nextLevel)}%`,
    }));
  }, [state.phase, state.level, state.roundPoints, tx, chain, clearSpawnTimers]);

  const toggleSound = useCallback(() => {
    setState((s) => ({ ...s, soundOn: !s.soundOn }));
  }, []);

  const setLastResult = useCallback((message: string) => {
    setState((s) => ({ ...s, lastResult: message }));
  }, []);

  const { phase, level, roundPoints, hasAttempt, multiplier } = state;
  const chance = hitChanceForChainLevel(level);
  const stageName = getStageName(level);

  const isChoiceTxPending =
    tx.isPending &&
    (tx.pendingAction === "cashOut" || tx.pendingAction === "nextLevel");

  const canTransact =
    chain.isConnected && !chain.isWrongChain && tx.isConnected;
  const txBlocksWhack =
    tx.isPending &&
    (tx.pendingAction === "cashOut" ||
      tx.pendingAction === "nextLevel" ||
      tx.pendingAction === "startGame" ||
      tx.pendingAction === "dailyCheckIn");
  const canPlayBoard =
    canTransact &&
    phase === "PLAYING" &&
    hasAttempt &&
    !isWhackResolving &&
    !txBlocksWhack;
  const showStartButton = phase === "WAITING_FOR_TX" || phase === "GAME_OVER";
  const showChoice = phase === "CHOOSING_REWARD";

  const statusText = (() => {
    if (chain.isWrongChain && chain.isConnected) {
      return SWITCH_TO_BASE_MAINNET_MESSAGE;
    }
    if (isWhackResolving) return "Resolving whack…";
    if (tx.isPending && tx.pendingAction === "cashOut") {
      return "Minting $BOOM on Base…";
    }
    if (tx.isPending && tx.pendingAction === "nextLevel") {
      return "Advancing level on Base…";
    }
    if (tx.isPending && tx.pendingAction === "startGame") {
      return "Starting game on Base…";
    }
    switch (phase) {
      case "WAITING_FOR_TX":
        if (!chain.isConnected) return "Connect wallet to play";
        if (
          chain.player?.status === CHAIN_STATUS.Playing ||
          chain.player?.status === CHAIN_STATUS.Choosing
        ) {
          return "Stale on-chain run — tap Start game to reset & play";
        }
        return "Tap Start game on Base Mainnet";
      case "PLAYING":
        return hasAttempt
          ? `Tap the glowing Warplet · Lv ${level} · ${chance}% · ${roundPoints.toFixed(0)} $BOOM`
          : "Resolving…";
      case "CHOOSING_REWARD":
        return isChoiceTxPending
          ? "Writing to blockchain…"
          : `Bank ${roundPoints.toFixed(0)} $BOOM — cash out or risk Level ${level + 1}`;
      case "GAME_OVER":
        return "Run ended — start a new game on Base";
      default:
        return "";
    }
  })();

  return {
    phase,
    level,
    multiplier,
    roundPoints,
    boomBalance: chain.boomBalance,
    isBalanceLoading: chain.isBalanceLoading,
    isWrongChain: chain.isWrongChain,
    canTransact,
    switchNetworkMessage: SWITCH_TO_BASE_MAINNET_MESSAGE,
    appChainName: chain.appChainName,
    hasAttempt,
    daily,
    activeWarplets: state.activeWarplets,
    lastResult: state.lastResult,
    soundOn: state.soundOn,
    chance,
    stageName,
    cashOutPreview: roundPoints,
    statusText,
    canPlayBoard,
    showStartButton,
    showChoice,
    isTxPending: tx.isPending || isWhackResolving,
    isChoiceTxPending,
    isWhackResolving,
    pendingAction: tx.pendingAction,
    isOnChain: chain.isOnChain,
    whack,
    startGame,
    cashOut,
    goToNextLevel,
    toggleSound,
    setLastResult,
    refetchChain: chain.refetchAll,
  };
}
