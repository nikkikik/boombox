import { APP_URL } from "@/constants/appUrl";

const DISMISSED_KEY = "boombox_fc_add_dismissed_at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const PROMPT_DELAY_MS = 1400;

/** addMiniApp() only works on the manifest production domain */
export function isFarcasterManifestHost(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.location.hostname === new URL(APP_URL).hostname;
  } catch {
    return false;
  }
}

export function wasAddAppRecentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISSED_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
}

export function markAddAppDismissed(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISSED_KEY, String(Date.now()));
}

export function clearAddAppDismissed(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DISMISSED_KEY);
}

function isAddAppRejected(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === "RejectedByUser" || /rejected/i.test(err.message);
}

type MiniAppSdk = {
  context: Promise<{ client: { added: boolean } }>;
  actions: {
    addMiniApp: () => Promise<unknown>;
  };
  on: (
    event: "miniAppAdded" | "miniAppAddRejected",
    listener: (...args: unknown[]) => void
  ) => void;
  off: (
    event: "miniAppAdded" | "miniAppAddRejected",
    listener: (...args: unknown[]) => void
  ) => void;
};

/** Native Farcaster “Add app” sheet — https://miniapps.farcaster.xyz/docs/sdk/actions/add-miniapp */
export async function promptAddMiniAppIfNeeded(sdk: MiniAppSdk): Promise<void> {
  if (!isFarcasterManifestHost()) return;
  if (wasAddAppRecentlyDismissed()) return;

  const context = await sdk.context;
  if (context.client.added) return;

  await new Promise((resolve) => setTimeout(resolve, PROMPT_DELAY_MS));

  const contextAfterDelay = await sdk.context;
  if (contextAfterDelay.client.added) return;

  try {
    await sdk.actions.addMiniApp();
    clearAddAppDismissed();
  } catch (err) {
    if (isAddAppRejected(err)) {
      markAddAppDismissed();
    }
  }
}
