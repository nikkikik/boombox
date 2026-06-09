"use client";

import { useEffect } from "react";
import { promptAddMiniAppIfNeeded } from "@/lib/farcasterAddApp";

/** Farcaster shell: hide splash + native “Add to apps” prompt */
export function useFarcasterMiniApp() {
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        const inMiniApp = await sdk.isInMiniApp();
        if (!inMiniApp || cancelled) return;

        await sdk.actions.ready();
        if (cancelled) return;

        await promptAddMiniAppIfNeeded(sdk);
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
