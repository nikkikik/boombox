"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { appChain } from "@/config/wagmi";
import { WalletConnectModal } from "./WalletConnectModal";

const HEADER_WALLET_BTN =
  "flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-blue-400/40 bg-[#1a2a5e]/95 text-center text-xs font-bold leading-tight text-blue-100 shadow-md transition-all active:scale-95 disabled:cursor-wait disabled:opacity-50 sm:text-sm";

function formatShortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface WalletButtonProps {
  headerSize?: boolean;
}

export function WalletButton({ headerSize = false }: WalletButtonProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const compact =
    "rounded-full border border-blue-400/40 bg-[#1a2a5e]/95 px-2.5 py-1.5 text-[10px] font-bold text-blue-100 shadow-md";
  const btnClass = headerSize ? HEADER_WALLET_BTN : compact;

  const modal = (
    <WalletConnectModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
  );

  if (isReconnecting) {
    return (
      <>
        <span className={headerSize ? HEADER_WALLET_BTN : compact}>…</span>
        {modal}
      </>
    );
  }

  if (isConnected && address) {
    return (
      <>
        <button
          type="button"
          onClick={() => disconnect()}
          className={btnClass}
          title={`${address.slice(0, 6)}…${address.slice(-4)} · ${appChain.name}`}
        >
          <span className="truncate px-0.5">{formatShortAddress(address)}</span>
        </button>
        {modal}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending || isConnecting}
        onClick={() => setPickerOpen(true)}
        className={btnClass}
      >
        <span className="truncate px-0.5">
          {isPending || isConnecting ? "…" : "Connect Wallet"}
        </span>
      </button>
      {modal}
    </>
  );
}
