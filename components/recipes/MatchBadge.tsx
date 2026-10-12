/** Background tone for a match percentage — shared by cards and the detail view. */
export function matchTone(pct: number): string {
  if (pct === 100) return 'bg-primary/90';
  if (pct >= 75) return 'bg-tertiary/90';
  if (pct >= 50) return 'bg-secondary/90';
  return 'bg-error/90';
}

export default function MatchBadge({ pct }: { pct: number }) {
  return (
    <span className={`${matchTone(pct)} text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl`}>
      {pct}% coincidencia
    </span>
  );
}
