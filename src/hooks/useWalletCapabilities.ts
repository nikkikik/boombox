"use client";

import { useMemo } from "react";
import { useCapabilities } from "wagmi";
import { appChainId } from "@/config/gameScore";

export function useWalletCapabilities() {
  const { data: capabilities } = useCapabilities();

  const supportsBatching = useMemo(() => {
    const atomic = capabilities?.[appChainId]?.atomic;
    return atomic?.status === "ready" || atomic?.status === "supported";
  }, [capabilities]);

  const supportsPaymaster = useMemo(() => {
    return (
      capabilities?.[appChainId]?.paymasterService?.supported === true
    );
  }, [capabilities]);

  return { supportsBatching, supportsPaymaster };
}
