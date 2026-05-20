"use client";

import { useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { useGameState } from "@/hooks/useGameState";
import { buildFarcasterShareText, getFarcasterShareUrl } from "@/lib/farcaster";
import { CosmicBackground } from "./CosmicBackground";
import { Header } from "./Header";
import { GameBoard } from "./GameBoard";
import { BottomPanel } from "./BottomPanel";

export function GameScreen() {
  const game = useGameState();
  const { isConnected } = useAccount();

  useEffect(() => {
    let cancelled = false;
    async function initFrame() {
      try {
        const { sdk } = await import("@farcaster/frame-sdk");
        if (!cancelled) await sdk.actions.ready();
      } catch {
        /* not in Farcaster frame */
      }
    }
    initFrame();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStartGame = useCallback(() => {
    void game.startGame();
  }, [game]);

  const handleCashOut = useCallback(() => {
    void game.cashOut();
  }, [game]);

  const handleNextLevel = useCallback(() => {
    void game.goToNextLevel();
  }, [game]);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col pb-6">
      <CosmicBackground />

      <Header daily={game.daily} />

      <div className="flex flex-1 flex-col justify-center pt-2">
        <GameBoard
          stageName={game.stageName}
          level={game.level}
          chance={game.chance}
          multiplier={game.multiplier}
          phase={game.phase}
          activeWarplets={game.activeWarplets}
          onWhack={game.whack}
          disabled={!game.canPlayBoard}
          isWhackPending={game.isWhackResolving}
        />
      </div>

      <BottomPanel
        phase={game.phase}
        level={game.level}
        multiplier={game.multiplier}
        hitChance={game.chance}
        boomBalance={game.boomBalance}
        isBalanceLoading={game.isBalanceLoading}
        isWrongChain={game.isWrongChain}
        appChainName={game.appChainName}
        roundPoints={game.roundPoints}
        statusText={game.statusText}
        lastResult={game.lastResult}
        cashOutPreview={game.cashOutPreview}
        showStartButton={game.showStartButton}
        showChoice={game.showChoice}
        isTxPending={game.isChoiceTxPending || game.pendingAction === "startGame"}
        pendingAction={game.pendingAction}
        isMockMode={game.isMockMode}
        isConnected={isConnected}
        switchNetworkMessage={game.switchNetworkMessage}
        onStartGame={handleStartGame}
        onCashOut={handleCashOut}
        onNextLevel={handleNextLevel}
      />
    </main>
  );
}
