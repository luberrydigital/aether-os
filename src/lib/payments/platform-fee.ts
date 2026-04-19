/** Deterministic platform fee in [0.18, 0.22] from any string id (e.g. company UUID). */
export function platformFeeRateFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  const basis = 1800 + (Math.abs(h) % 401);
  return Math.min(0.22, basis / 10_000);
}
