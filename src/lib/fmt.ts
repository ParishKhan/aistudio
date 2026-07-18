/** Shared display formatters — every number on the site goes through these. */

/** 1050000 → "1.05M", 200000 → "200K", 128000 → "128K". */
export function tokens(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

/** 1050000 → "1,050,000". */
export function tokensLong(n: number): string {
  return n.toLocaleString('en-US');
}

/** 5 → "$5.00", 0.5 → "$0.50", 0.075 → "$0.075". */
export function usd(n: number): string {
  const decimals = n < 0.1 && n !== 0 ? 3 : 2;
  return `$${n.toFixed(decimals)}`;
}

export function date(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** "2026-02" or "2026-02-16" → "Feb 2026" / "Feb 16, 2026". */
export function cutoff(value: string): string {
  const parts = value.split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], (parts[1] ?? 1) - 1, parts[2] ?? 1));
  return parts.length >= 3
    ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** Score display honoring the benchmark's scoreType. */
export function score(value: number, scoreType: 'percent' | 'elo' | 'score'): string {
  if (scoreType === 'percent') return `${value}%`;
  if (scoreType === 'elo') return `${value.toLocaleString('en-US')} Elo`;
  return String(value);
}
