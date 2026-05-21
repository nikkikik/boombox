/** Canonical production URL (no trailing slash). Override on Vercel. */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://boombox-one.vercel.app"
).replace(/\/$/, "");
