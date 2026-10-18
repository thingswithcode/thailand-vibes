export interface ActiveCandidate {
  id: string;
  top: number;
  bottom: number;
  hidden: boolean;
}

export function pickActive(items: ActiveCandidate[], target: number): string | null {
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const item of items) {
    if (item.hidden || item.bottom - item.top <= 0) continue;
    const distance = Math.abs((item.top + item.bottom) / 2 - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = item.id;
    }
  }
  return best;
}
