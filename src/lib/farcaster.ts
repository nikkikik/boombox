export function buildFarcasterShareText(params: {
  multiplier: number;
  points: number;
  stage: string;
}): string {
  const { multiplier, points, stage } = params;
  return `I just hit a ${multiplier.toFixed(2)}x multiplier in Boombox ${stage}! Scored ${points.toFixed(1)} PTS. Can you beat my score? сохрани в био`;
}

export function getFarcasterShareUrl(text: string): string {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
}
