interface Props {
  abbreviation: string;
}

export function CryptoIcon({ abbreviation }: Props) {
  const colors: Record<string, string> = {
    BTC: "bg-amber-100 text-amber-600",
    ETH: "bg-indigo-100 text-indigo-600",
    USDT: "bg-emerald-100 text-emerald-600",
    BNB: "bg-yellow-100 text-yellow-600",
    SOL: "bg-purple-100 text-purple-600",
  };
  const cls = colors[abbreviation.toUpperCase()] ?? "bg-secondary/10 text-secondary";
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${cls}`}>
      {abbreviation.slice(0, 3).toUpperCase()}
    </div>
  );
}
