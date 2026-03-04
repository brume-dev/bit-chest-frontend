import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function ChangeCell({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-sm font-semibold ${positive ? "text-success" : "text-error"}`}
    >
      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {positive ? "+" : ""}
      {pct.toFixed(2)}%
    </span>
  );
}
