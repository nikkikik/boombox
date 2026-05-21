"use client";

import { useAccount, useDisconnect } from "wagmi";
import { appChain } from "@/config/wagmi";
import { useWalletPicker } from "@/contexts/WalletPickerContext";

const HEADER_WALLET_BTN =
  "flex h-full w-full min-w-0 items-center justify-center rounded-full border border-blue-400/40 bg-[#1a2a5e]/95 px-2 text-center text-[10px] font-bold leading-tight text-blue-100 shadow-md transition-all active:scale-95 sm:text-xs";

function formatShortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

interface WalletButtonProps {
  headerSize?: boolean;
}

export function WalletButton({ headerSize = false }: WalletButtonProps) {
  const { openWalletPicker } = useWalletPicker();
  const { address, isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();

  const compact =
    "rounded-full border border-blue-400/40 bg-[#1a2a5e]/95 px-2.5 py-1.5 text-[10px] font-bold text-blue-100 shadow-md";
  const btnClass = headerSize ? HEADER_WALLET_BTN : compact;

  const connectLabel = headerSize ? "Wallet" : "Connect Wallet";

  if (isConnected && address && status === "connected") {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className={btnClass}
        title={`${address.slice(0, 6)}…${address.slice(-4)} · ${appChain.name}`}
      >
        <span className="whitespace-nowrap">{formatShortAddress(address)}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openWalletPicker}
      className={btnClass}
      aria-label={connectLabel}
    >
      <span className="whitespace-nowrap">{connectLabel}</span>
    </button>
  );
}
