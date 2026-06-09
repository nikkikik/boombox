"use client";

import { useAccount, useDisconnect } from "wagmi";
import { appChain } from "@/config/wagmi";
import { useWalletPicker } from "@/contexts/WalletPickerContext";

function formatShortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletButton() {
  const { openWalletPicker } = useWalletPicker();
  const { address, isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();

  if (status === "connecting" || status === "reconnecting") {
    return (
      <button type="button" disabled className="btn-app opacity-70">
        <span className="truncate">Connecting…</span>
      </button>
    );
  }

  if (isConnected && address && status === "connected") {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="btn-app"
        title={`${address} · ${appChain.name}`}
      >
        <span className="truncate">{formatShortAddress(address)}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openWalletPicker}
      className="btn-app"
      aria-label="Connect wallet"
    >
      Wallet
    </button>
  );
}
