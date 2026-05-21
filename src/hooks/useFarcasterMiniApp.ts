"use client";

import { useEffect } from "react";

/** Call sdk.actions.ready() inside Farcaster / Warpcast mini app shell */
export function useFarcasterMiniApp() {
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        if (!cancelled) {
          await sdk.actions.ready();
        }
      } catch {
        try {
          const { sdk } = await import("@farcaster/frame-sdk");
          if (!cancelled) await sdk.actions.ready();
        } catch {
          /* opened in normal browser */
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);
}
