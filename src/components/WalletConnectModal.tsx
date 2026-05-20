"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useConnect } from "wagmi";
import { appChain } from "@/config/wagmi";
import {
  getWalletOptionDescription,
  getWalletOptionLabel,
} from "@/lib/walletLabels";

interface WalletConnectModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ open, onClose }: WalletConnectModalProps) {
  const [mounted, setMounted] = useState(false);
  const { connectAsync, connectors, isPending, error } = useConnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-[201] w-[min(340px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl panel-glass p-4 shadow-2xl"
            initial={{ opacity: 0, scale: 0.92, y: "-45%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.92, y: "-45%" }}
            role="dialog"
            aria-labelledby="wallet-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="wallet-modal-title"
              className="text-center text-sm font-bold uppercase tracking-wide text-white"
            >
              Connect wallet
            </h2>
            <p className="mt-1 text-center text-[11px] text-slate-400">
              Base · Farcaster · Browser
            </p>

            <ul className="mt-4 space-y-2">
              {connectors.length === 0 ? (
                <li className="py-4 text-center text-xs text-slate-400">
                  No wallets available in this browser
                </li>
              ) : (
                connectors.map((connector) => (
                  <li key={connector.uid}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={async () => {
                        try {
                          await connectAsync({
                            connector,
                            chainId: appChain.id,
                          });
                          onClose();
                        } catch {
                          /* error shown below */
                        }
                      }}
                      className="w-full rounded-xl border border-blue-400/30 bg-[#1a2a5e]/80 px-4 py-3 text-left transition hover:border-blue-300/60 hover:bg-[#243a6e] disabled:opacity-50"
                    >
                      <span className="block text-sm font-bold text-blue-100">
                        {getWalletOptionLabel(connector)}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">
                        {getWalletOptionDescription(connector)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>

            {error && (
              <p className="mt-3 text-center text-xs text-red-400">
                {error.message.slice(0, 120)}
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-xl border border-white/20 py-2 text-xs text-slate-300"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
