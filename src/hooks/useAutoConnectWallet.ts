"use client";

import { useEffect, useRef } from "react";
import { useAccount, useConnect, useReconnect } from "wagmi";
import { appChain } from "@/config/wagmi";
import { isBaseApp } from "@/lib/detectBaseApp";

/** Silently connect Base Smart Wallet inside the Base app shell */
export function useAutoConnectWallet() {
  const tried = useRef(false);
  const { isConnected, status } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { reconnectAsync } = useReconnect();

  useEffect(() => {
    if (!isBaseApp() || tried.current) return;
    if (isConnected || status === "connecting" || status === "reconnecting") return;

    const baseConnector = connectors.find((c) => c.id === "baseAccount");
    if (!baseConnector) return;

    tried.current = true;

    void (async () => {
      try {
        await connectAsync({ connector: baseConnector, chainId: appChain.id });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (/already connected/i.test(message)) {
          await reconnectAsync({ connectors: [baseConnector] }).catch(() => {});
        }
      }
    })();
  }, [connectAsync, connectors, isConnected, reconnectAsync, status]);
}
