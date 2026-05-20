"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  INITIAL_MULTIPLIER,
  MULTIPLIER_STEP,
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
} from "@/lib/onchainGame";
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
  const tx = useGameTransactions();
  const daily = useDailyCheckIn(chain, tx);

  const [state, setState] = useState<GameState>({
    phase: "WAITING_FOR_TX",
    level: 0,
    multiplier: INITIAL_MULTIPLIER,
    roundPoints: 0,
    hasAttempt: false,
    activeWarplets: [],
    lastResult: chain.isOnChain
      ? "Connect wallet & start on Base Sepolia"
      : "Set contract addresses in .env.local",
    soundOn: true,
  });

  const spawnTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastChainNonce = useRef<bigint | null>(null);

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

  const syncFromChain = useCallback(() => {
    const p = chain.player;
    if (!p || !chain.isOnChain) return;

    const phase = chainStatusToPhase(p.status);
    const roundPoints = boomWeiToNumber(p.potentialReward);
    const level = p.level;
    const hasAttempt = p.status === CHAIN_STATUS.Playing;

    setState((s) => ({
      ...s,
      phase,
      level,
      multiplier: multiplierForLevel(level),
      roundPoints,
      hasAttempt,
      ...(phase !== "PLAYING" ? { activeWarplets: [] } : {}),
    }));
  }, [chain.player, chain.isOnChain]);

  useEffect(() => {
    if (!chain.isOnChain || !chain.player) return;
    if (lastChainNonce.current !== chain.player.nonce) {
      lastChainNonce.current = chain.player.nonce;
    }
    syncFromChain();
  }, [chain.player, chain.isOnChain, syncFromChain]);

  const spawnWarplet = useCallback(() => {
    setState((s) => {
      if (s.phase !== "PLAYING" || !s.hasAttempt || tx.isPending) return s;
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
  }, [scheduleTimer, tx.isPending]);

  useEffect(() => {
    if (state.phase !== "PLAYING" || !state.hasAttempt) return;
    const interval = setInterval(spawnWarplet, SPAWN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state.phase, state.hasAttempt, spawnWarplet]);

  useEffect(() => () => clearSpawnTimers(), [clearSpawnTimers]);

  const startGame = useCallback(async (): Promise<boolean> => {
    if (!tx.isConnected) {
      setState((s) => ({ ...s, lastResult: "Connect wallet to start" }));
      return false;
    }

    setState((s) => ({
      ...s,
      phase: "WAITING_FOR_TX",
      lastResult: tx.isMockMode
        ? "Mock: starting game…"
        : "Confirm startGame in wallet…",
    }));

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
    await chain.refetchAll();
    syncFromChain();

    setState((s) => ({
      ...s,
      ...playingSnapshot(1),
      roundPoints: 0,
      lastResult: hash
        ? `Game started · ${hash.slice(0, 10)}…`
        : "Level 1 — good luck!",
    }));
    return true;
  }, [tx, chain, clearSpawnTimers, syncFromChain]);

  const whack = useCallback(
    async (holeIndex: number): Promise<"hit" | "miss" | "noop"> => {
      if (state.phase !== "PLAYING" || !state.hasAttempt || tx.isPending) {
        return "noop";
      }

      const warplet = state.activeWarplets.find(
        (w) =>
          w.holeIndex === holeIndex &&
          w.visible &&
          w.animState === "active"
      );

      setState((s) => ({
        ...s,
        hasAttempt: false,
        lastResult: tx.isOnChain ? "Confirm whack in wallet…" : "Resolving…",
      }));
      clearSpawnTimers();

      const hideKey = `hide-${holeIndex}`;
      const hideT = spawnTimers.current.get(hideKey);
      if (hideT) clearTimeout(hideT);
      spawnTimers.current.delete(hideKey);

      if (tx.isOnChain) {
        const { ok } = await tx.whack();
        if (!ok) {
          setState((s) => ({
            ...s,
            hasAttempt: true,
            lastResult: tx.error?.message?.slice(0, 80) ?? "Whack cancelled",
          }));
          return "noop";
        }
        await chain.refetchAll();
        const p = await chain.refetchPlayer();
        if (!p) return "noop";
        syncFromChain();

        if (p.status === CHAIN_STATUS.Choosing) {
          const earned = boomWeiToNumber(p.potentialReward);
          if (warplet) {
            setState((s) => ({
              ...s,
              phase: "CHOOSING_REWARD",
              roundPoints: earned,
              activeWarplets: s.activeWarplets.map((w) =>
                w.holeIndex === holeIndex
                  ? { ...w, animState: "explode" as WarpletAnimState }
                  : w
              ),
              lastResult: `Hit! ${earned.toFixed(0)} $BOOM banked — cash out or next level?`,
            }));
            scheduleTimer(`explode-${holeIndex}`, () => {
              setState((prev) => ({
                ...prev,
                activeWarplets: prev.activeWarplets.filter(
                  (w) => w.holeIndex !== holeIndex
                ),
              }));
            }, EXPLODE_MS);
          } else {
            setState((s) => ({
              ...s,
              phase: "CHOOSING_REWARD",
              roundPoints: earned,
              lastResult: `Hit! ${earned.toFixed(0)} $BOOM — cash out or next level?`,
            }));
          }
          return "hit";
        }

        if (p.status === CHAIN_STATUS.GameOver) {
          setState((s) => ({
            ...s,
            phase: "GAME_OVER",
            level: 0,
            roundPoints: 0,
            activeWarplets: [],
            lastResult: "Miss! Run over — start again on Base",
          }));
          return "miss";
        }

        return "noop";
      }

      // Offline mock fallback (no contracts)
      if (!warplet) {
        setState((s) => ({
          ...s,
          phase: "GAME_OVER",
          level: 0,
          roundPoints: 0,
          activeWarplets: [],
          lastResult: "Miss! Run over — pay to play again.",
        }));
        return "miss";
      }

      const chance = getLevelChance(state.level);
      const roll = Math.random() * 100;
      const success = roll < chance;

      if (!success) {
        scheduleTimer("gameover-mock", () => {
          setState((s) => ({
            ...s,
            phase: "GAME_OVER",
            level: 0,
            roundPoints: 0,
            activeWarplets: [],
            lastResult: "Run over — pay to play again.",
          }));
        }, 480);
        return "miss";
      }

      const earned = 100 * Math.pow(2, state.level - 1);
      setState((s) => ({
        ...s,
        phase: "CHOOSING_REWARD",
        roundPoints: s.roundPoints + earned,
        activeWarplets: s.activeWarplets.map((w) =>
          w.holeIndex === holeIndex
            ? { ...w, animState: "explode" as WarpletAnimState }
            : w
        ),
        lastResult: `Hit! +${earned} $BOOM — cash out or next level?`,
      }));
      scheduleTimer(`explode-${holeIndex}`, () => {
        setState((prev) => ({
          ...prev,
          activeWarplets: prev.activeWarplets.filter(
            (w) => w.holeIndex !== holeIndex
          ),
        }));
      }, EXPLODE_MS);
      return "hit";
    },
    [
      state.phase,
      state.hasAttempt,
      state.activeWarplets,
      state.level,
      tx,
      chain,
      clearSpawnTimers,
      scheduleTimer,
      syncFromChain,
    ]
  );

  const cashOut = useCallback(async (): Promise<boolean> => {
    if (state.phase !== "CHOOSING_REWARD") return false;
    if (!tx.isConnected) {
      setState((s) => ({ ...s, lastResult: "Connect wallet to cash out" }));
      return false;
    }

    const payout = state.roundPoints;
    setState((s) => ({
      ...s,
      lastResult: tx.isMockMode
        ? "Mock: claiming…"
        : "Confirm cashOut in wallet…",
    }));

    const { ok, hash } = await tx.cashOut();
    if (!ok) {
      setState((s) => ({
        ...s,
        lastResult: tx.error?.message?.slice(0, 80) ?? "Cash out cancelled",
      }));
      return false;
    }

    clearSpawnTimers();
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
  }, [state.phase, state.roundPoints, tx, chain, clearSpawnTimers, syncFromChain]);

  const goToNextLevel = useCallback(async () => {
    if (state.phase !== "CHOOSING_REWARD") return;

    if (tx.isOnChain) {
      setState((s) => ({
        ...s,
        lastResult: "Confirm nextLevel in wallet…",
      }));
      const { ok } = await tx.nextLevel();
      if (!ok) {
        setState((s) => ({
          ...s,
          lastResult: tx.error?.message?.slice(0, 80) ?? "Cancelled",
        }));
        return;
      }
      await chain.refetchAll();
      syncFromChain();
      const lvl = chain.player?.level ?? state.level + 1;
      setState((s) => ({
        ...s,
        ...playingSnapshot(lvl),
        lastResult: `Level ${lvl} — hit chance ${hitChanceForChainLevel(lvl)}%`,
      }));
      return;
    }

    clearSpawnTimers();
    const nextLevel = state.level + 1;
    setState((s) => ({
      ...s,
      ...playingSnapshot(nextLevel),
      lastResult: `Level ${nextLevel} — hit chance ${getLevelChance(nextLevel)}%`,
    }));
  }, [state.phase, state.level, tx, chain, clearSpawnTimers, syncFromChain]);

  const toggleSound = useCallback(() => {
    setState((s) => ({ ...s, soundOn: !s.soundOn }));
  }, []);

  const setLastResult = useCallback((message: string) => {
    setState((s) => ({ ...s, lastResult: message }));
  }, []);

  const level = chain.isOnChain && chain.player ? chain.player.level : state.level;
  const chance = hitChanceForChainLevel(level);
  const stageName = getStageName(level);
  const roundPoints =
    chain.isOnChain && chain.player
      ? boomWeiToNumber(chain.player.potentialReward)
      : state.roundPoints;
  const phase =
    chain.isOnChain && chain.player
      ? chainStatusToPhase(chain.player.status)
      : state.phase;
  const multiplier = multiplierForLevel(level);
  const hasAttempt =
    chain.isOnChain && chain.player
      ? chain.player.status === CHAIN_STATUS.Playing
      : state.hasAttempt;

  const canPlayBoard = phase === "PLAYING" && hasAttempt && !tx.isPending;
  const showStartButton = phase === "WAITING_FOR_TX" || phase === "GAME_OVER";
  const showChoice = phase === "CHOOSING_REWARD";

  const statusText = (() => {
    if (tx.isPending && tx.pendingAction) {
      return `Waiting for ${tx.pendingAction} on Base…`;
    }
    switch (phase) {
      case "WAITING_FOR_TX":
        return chain.isOnChain
          ? "Pay gas only — confirm startGame on Base Sepolia"
          : "Configure NEXT_PUBLIC_GAME_CONTRACT_ADDRESS";
      case "PLAYING":
        return hasAttempt
          ? `One shot · Level ${level} · ${chance}% · ${roundPoints.toFixed(0)} $BOOM banked`
          : "Confirming whack on-chain…";
      case "CHOOSING_REWARD":
        return `Bank ${roundPoints.toFixed(0)} $BOOM — cash out or risk Level ${level + 1}`;
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
    isTxPending: tx.isPending,
    pendingAction: tx.pendingAction,
    isMockMode: tx.isMockMode,
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
