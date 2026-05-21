"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { appChain } from "@/config/wagmi";
import { WalletConnectModal } from "./WalletConnectModal";

const HEADER_WALLET_BTN =
  "flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-blue-400/40 bg-[#1a2a5e]/95 text-center text-[10px] font-bold leading-tight text-blue-100 shadow-md transition-all active:scale-95 disabled:cursor-wait disabled:opacity-50 sm:text-xs";

const RECONNECT_TIMEOUT_MS = 3500;

function formatShortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

interface WalletButtonProps {
  headerSize?: boolean;
}

export function WalletButton({ headerSize = false }: WalletButtonProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reconnectTimedOut, setReconnectTimedOut] = useState(false);
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (!isReconnecting) {
      setReconnectTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      setReconnectTimedOut(true);
      disconnect();
    }, RECONNECT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isReconnecting, disconnect]);

  const compact =
    "rounded-full border border-blue-400/40 bg-[#1a2a5e]/95 px-2.5 py-1.5 text-[10px] font-bold text-blue-100 shadow-md";
  const btnClass = headerSize ? HEADER_WALLET_BTN : compact;

  const isLoading =
    isPending ||
    isConnecting ||
    (isReconnecting && !reconnectTimedOut);

  const connectLabel = headerSize ? "Connect" : "Connect Wallet";

  const modal = (
    <WalletConnectModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
  );

  if (isConnected && address) {
    return (
      <>
        <button
          type="button"
          onClick={() => disconnect()}
          className={btnClass}
          title={`${address.slice(0, 6)}…${address.slice(-4)} · ${appChain.name}`}
        >
          <span className="whitespace-nowrap px-0.5">
            {formatShortAddress(address)}
          </span>
        </button>
        {modal}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setPickerOpen(true)}
        className={btnClass}
        aria-label={isLoading ? "Connecting wallet" : connectLabel}
      >
        <span className="whitespace-nowrap px-0.5">
          {isLoading ? "…" : connectLabel}
        </span>
      </button>
      {modal}
    </>
  );
}
