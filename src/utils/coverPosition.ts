export function parseCoverObjectPosition(
  input: string | null | undefined
): { x: number; y: number } {
  if (!input?.trim()) return { x: 50, y: 50 };
  const parts = input.trim().split(/\s+/);
  const parsePct = (p: string) => {
    const n = Number.parseFloat(p.replace("%", ""));
    if (!Number.isFinite(n)) return 50;
    return Math.min(100, Math.max(0, n));
  };
  if (parts.length >= 2) {
    return { x: parsePct(parts[0]!), y: parsePct(parts[1]!) };
  }
  return { x: 50, y: 50 };
}

export function formatCoverObjectPosition(x: number, y: number): string {
  const cx = Math.round(Math.min(100, Math.max(0, x)));
  const cy = Math.round(Math.min(100, Math.max(0, y)));
  return `${cx}% ${cy}%`;
}
