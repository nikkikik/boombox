/** Космический молоток — hotspot у головки */

function hammerSvg(size: number, headId: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 56 56">
  <defs>
    <linearGradient id="${headId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:%23ff6eb4"/>
      <stop offset="50%" style="stop-color:%23ff9f43"/>
      <stop offset="100%" style="stop-color:%23e85d04"/>
    </linearGradient>
    <linearGradient id="handle-${headId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:%238b5a2b"/>
      <stop offset="100%" style="stop-color:%235c3a1a"/>
    </linearGradient>
    <filter id="glow-${headId}"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <ellipse cx="28" cy="44" rx="14" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g filter="url(%23glow-${headId})" transform="rotate(-25 28 28)">
    <rect x="24" y="22" width="8" height="26" rx="3" fill="url(%23handle-${headId})" stroke="%231a0a00" stroke-width="1.2"/>
    <rect x="10" y="6" width="36" height="22" rx="6" fill="url(%23${headId})" stroke="%23fff" stroke-width="1.5" opacity="0.95"/>
    <rect x="14" y="10" width="12" height="6" rx="2" fill="rgba(255,255,255,0.35)"/>
    <path d="M38 14 L44 8 L46 12 Z" fill="%23ffd700" stroke="%23b8860b" stroke-width="0.8"/>
  </g>
</svg>`;
}

const HAMMER_NORMAL = hammerSvg(56, "head");
const HAMMER_LARGE = hammerSvg(80, "headLg");

export const HAMMER_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(HAMMER_NORMAL)}") 26 38, pointer`;

/** Крупный молоток при наведении на активного варплета */
export const HAMMER_CURSOR_WARPLET = `url("data:image/svg+xml,${encodeURIComponent(HAMMER_LARGE)}") 36 52, pointer`;

export const HAMMER_CURSOR_DISABLED = "not-allowed";
