interface Props {
  abbreviation: string;
}

// Display crypto icon with color-coded background
export function CryptoIcon({ abbreviation }: Props) {
  // Define color palette for major cryptos
  const colors: Record<string, string> = {
    BTC: "bg-amber-100 text-amber-600",
    ETH: "bg-indigo-100 text-indigo-600",
    USDT: "bg-emerald-100 text-emerald-600",
    BNB: "bg-yellow-100 text-yellow-600",
    SOL: "bg-purple-100 text-purple-600",
  };
  const cls = colors[abbreviation.toUpperCase()] ?? "bg-secondary/10 text-secondary"; // Default style
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${cls}`}>
      {abbreviation.slice(0, 3).toUpperCase()}
    </div>
  );
}
