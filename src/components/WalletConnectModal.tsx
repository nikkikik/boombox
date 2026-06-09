"use client";

import { useEffect, useMemo, useState } from "react";
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

/** One entry per wallet type — Base app injects duplicate connectors */
const PREFERRED_CONNECTOR_IDS = [
  "baseAccount",
  "coinbaseWalletSDK",
  "farcaster",
  "farcasterMiniApp",
  "injected",
] as const;

function dedupeConnectors(
  connectors: ReturnType<typeof useConnect>["connectors"]
) {
  const seen = new Set<string>();
  const sorted = [...connectors].sort((a, b) => {
    const ai = PREFERRED_CONNECTOR_IDS.indexOf(
      a.id as (typeof PREFERRED_CONNECTOR_IDS)[number]
    );
    const bi = PREFERRED_CONNECTOR_IDS.indexOf(
      b.id as (typeof PREFERRED_CONNECTOR_IDS)[number]
    );
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return sorted.filter((connector) => {
    let key = connector.id;
    if (key === "coinbaseWalletSDK") key = "baseAccount";
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function WalletConnectModal({ open, onClose }: WalletConnectModalProps) {
  const [mounted, setMounted] = useState(false);
  const { connectAsync, connectors, isPending, error } = useConnect();
  const walletOptions = useMemo(
    () => dedupeConnectors(connectors),
    [connectors]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{
            paddingTop: "max(1rem, env(safe-area-inset-top))",
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            paddingLeft: "max(1rem, env(safe-area-inset-left))",
            paddingRight: "max(1rem, env(safe-area-inset-right))",
          }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-labelledby="wallet-modal-title"
            aria-modal="true"
            className="relative z-[1] flex max-h-[min(520px,85dvh)] w-full max-w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl panel-glass shadow-2xl"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-4">
              <h2
                id="wallet-modal-title"
                className="text-center text-sm font-bold uppercase tracking-wide text-white"
              >
                Connect wallet
              </h2>
              <p className="mt-1 text-center text-[11px] text-slate-400">
                Base · Farcaster · Browser
              </p>
            </div>

            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-3">
              {walletOptions.length === 0 ? (
                <li className="py-4 text-center text-xs text-slate-400">
                  No wallets available in this browser
                </li>
              ) : (
                walletOptions.map((connector) => (
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
                      className="btn-app h-auto min-h-12 flex-col items-start gap-0.5 rounded-2xl px-4 py-3 normal-case tracking-normal"
                    >
                      <span className="block truncate text-xs font-medium text-slate-100">
                        {getWalletOptionLabel(connector)}
                      </span>
                      <span className="block text-[10px] leading-snug text-slate-400">
                        {getWalletOptionDescription(connector)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>

            {error && (
              <p className="shrink-0 px-4 pb-2 text-center text-xs text-red-400">
                {error.message.slice(0, 120)}
              </p>
            )}

            <div className="shrink-0 border-t border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-app normal-case tracking-normal"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
