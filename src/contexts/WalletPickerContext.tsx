"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { WalletConnectModal } from "@/components/WalletConnectModal";

type WalletPickerContextValue = {
  openWalletPicker: () => void;
};

const WalletPickerContext = createContext<WalletPickerContextValue>({
  openWalletPicker: () => {},
});

/** Drop legacy wagmi cookieStorage entries that trap mobile browsers in "reconnecting". */
function clearLegacyWagmiCookies() {
  if (typeof document === "undefined") return;
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name?.toLowerCase().includes("wagmi")) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }
}

export function WalletPickerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openWalletPicker = useCallback(() => setOpen(true), []);

  useEffect(() => {
    clearLegacyWagmiCookies();
  }, []);

  return (
    <WalletPickerContext.Provider value={{ openWalletPicker }}>
      {children}
      <WalletConnectModal open={open} onClose={() => setOpen(false)} />
    </WalletPickerContext.Provider>
  );
}

export function useWalletPicker() {
  return useContext(WalletPickerContext);
}
