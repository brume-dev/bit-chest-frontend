import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { fmt, fmtUSD } from "../lib/helpers";

// Display P/L value with trend icon and color
export function PnlBadge({ pnl, pnlPct }: { pnl: number; pnlPct: number }) {
	// Show neutral badge for negligible P/L
	if (Math.abs(pnl) < 0.005) {
		return (
			<div className="flex flex-col items-end gap-0.5">
				<span className="text-sm font-bold text-neutral/40">$0.00</span>
				<span className="text-xs text-neutral/30 flex items-center gap-0.5">
					<Minus size={10} /> 0.00%
				</span>
			</div>
		);
	}
	// Show gain or loss with appropriate color
	const positive = pnl > 0;
	return (
		<div className="flex flex-col items-end gap-0.5">
			<span
				className={`text-sm font-bold ${positive ? "text-success" : "text-error"}`}
			>
				{positive ? "+" : ""}
				{fmtUSD(pnl)}
			</span>
			<span
				className={`text-xs flex items-center gap-0.5 ${positive ? "text-success" : "text-error"}`}
			>
				{positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
				{positive ? "+" : ""}
				{fmt(pnlPct)}%
			</span>
		</div>
	);
}
