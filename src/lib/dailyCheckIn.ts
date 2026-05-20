export const DAILY_CHECK_IN_STORAGE_KEY = "boombox_last_check_in";
export const DAILY_CHECK_IN_REWARD = 10;

/** Calendar day key in local timezone (YYYY-MM-DD) */
export function getTodayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isDailyCheckInAvailable(lastCheckInDate: string | null): boolean {
  if (!lastCheckInDate) return true;
  return lastCheckInDate !== getTodayDateKey();
}

/** Time until next local midnight, e.g. "5h 12m" */
export function getTimeUntilNextCheckIn(): string {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const diff = Math.max(0, next.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
