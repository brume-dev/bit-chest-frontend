import {
	BarChart3,
	DollarSign,
	Minus,
	TrendingDown,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { buildPortfolio, fmt, formatEur, latestPrice } from "../lib/helpers";
import { useCryptos, useCurrentUser, useTransactions } from "../lib/hooks";
import type { PortfolioRow } from "../lib/types";

// ── sub-components ─────────────────────────────────────────────────────────

function StatCard({
	label,
	value,
	sub,
	positive,
	icon: Icon,
}: {
	label: string;
	value: string;
	sub?: string | null;
	positive?: boolean | null;
	icon: React.ElementType;
}) {
	return (
		<div className="card bg-base-100 border border-base-200 shadow-sm p-5 flex flex-col gap-3">
			<div className="flex items-center gap-2 text-neutral/50">
				<Icon size={15} />
				<span className="text-xs font-medium uppercase tracking-widest">
					{label}
				</span>
			</div>
			<p className="text-2xl sm:text-3xl font-bold text-neutral">{value}</p>
			{sub != null && (
				<span
					className={`text-xs font-semibold ${
						positive === true
							? "text-success"
							: positive === false
								? "text-error"
								: "text-neutral/40"
					}`}
				>
					{sub}
				</span>
			)}
		</div>
	);
}

function CryptoAvatar({ abbr }: { abbr: string }) {
	const colors: Record<string, string> = {
		BTC: "bg-amber-500",
		ETH: "bg-indigo-500",
		USDT: "bg-teal-500",
		SOL: "bg-purple-500",
		BNB: "bg-yellow-400",
		ADA: "bg-blue-500",
		XRP: "bg-sky-500",
	};
	const bg = colors[abbr] ?? "bg-neutral";
	return (
		<div
			className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}
		>
			<span className="text-white text-[10px] font-bold">
				{abbr.slice(0, 3)}
			</span>
		</div>
	);
}

function PnlBadge({ change24h }: { change24h: number }) {
	if (Math.abs(change24h) < 0.005) {
		return (
			<span className="text-sm font-bold text-neutral/40 flex items-center justify-end gap-0.5">
				<Minus size={12} /> 0.00%
			</span>
		);
	}
	const positive = change24h > 0;
	return (
		<span
			className={`text-sm font-bold flex items-center justify-end gap-0.5 ${positive ? "text-success" : "text-error"}`}
		>
			{positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
			{positive ? "+" : ""}
			{fmt(change24h)}%
		</span>
	);
}

function SkeletonRow() {
	return (
		<div className="flex items-center gap-4 px-5 py-4 animate-pulse border-b border-base-200">
			<div className="w-9 h-9 rounded-full bg-base-200 shrink-0" />
			<div className="flex-1 space-y-2">
				<div className="h-3 w-24 bg-base-200 rounded" />
				<div className="h-2 w-12 bg-base-200 rounded" />
			</div>
			<div className="h-3 w-16 bg-base-200 rounded hidden sm:block" />
			<div className="h-3 w-20 bg-base-200 rounded hidden md:block" />
			<div className="h-3 w-16 bg-base-200 rounded" />
		</div>
	);
}

// ── main page ──────────────────────────────────────────────────────────────

export function PortfolioPage() {
	const { data: user } = useCurrentUser();
	const { data: transactions = [], isLoading: txLoading } = useTransactions();
	const { data: cryptos = [], isLoading: cryptosLoading } = useCryptos();

	const isLoading = txLoading || cryptosLoading;

	const portfolio: PortfolioRow[] = isLoading
		? []
		: buildPortfolio(transactions, cryptos);

	const totalValue = portfolio.reduce((s, r) => s + r.valueEur, 0);

	// Weighted average 24h % change, then convert to EUR amount
	const weighted24hPct =
		totalValue > 0
			? portfolio.reduce(
					(s, r) => s + (r.valueEur / totalValue) * r.change24h,
					0,
				)
			: 0;
	const change24hEur = totalValue > 0 ? (weighted24hPct / 100) * totalValue : 0;

	// Total P/L: current value vs sum of buy/sell costs
	const costBasis = transactions.reduce((sum, tx) => {
		const val = parseFloat(tx.amount) * parseFloat(tx.price.value);
		return sum + (tx.type === "buy" ? val : -val);
	}, 0);
	const totalPnl = totalValue - costBasis;
	const totalPnlPct =
		costBasis !== 0 ? (totalPnl / Math.abs(costBasis)) * 100 : 0;

	return (
		<div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 font-sans">
			{/* Header */}
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold text-neutral">
					My Portfolio
				</h1>
				{user && (
					<p className="text-sm text-neutral/50 mt-1">
						Welcome back, {user.firstName}
					</p>
				)}
			</div>

			{/* Stat cards */}
			{isLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							className="card bg-base-100 border border-base-200 shadow-sm p-5 h-36 animate-pulse"
						>
							<div className="h-3 w-24 bg-base-200 rounded mb-4" />
							<div className="h-8 w-32 bg-base-200 rounded mb-3" />
							<div className="h-3 w-16 bg-base-200 rounded" />
						</div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<StatCard
						label="Total Portfolio Value"
						value={formatEur(totalValue)}
						icon={Wallet}
					/>
					<StatCard
						label="24h Change"
						value={formatEur(change24hEur)}
						sub={
							weighted24hPct === 0
								? null
								: `${weighted24hPct > 0 ? "+" : ""}${fmt(weighted24hPct)}%`
						}
						positive={weighted24hPct === 0 ? null : weighted24hPct > 0}
						icon={BarChart3}
					/>
					<StatCard
						label="Total Profit / Loss"
						value={formatEur(totalPnl)}
						sub={
							totalPnl === 0
								? null
								: `${totalPnl > 0 ? "+" : ""}${fmt(totalPnlPct)}%`
						}
						positive={totalPnl === 0 ? null : totalPnl > 0}
						icon={DollarSign}
					/>
				</div>
			)}

			{/* Asset table */}
			<div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
				{isLoading ? (
					<div className="divide-y divide-base-200">
						{[0, 1, 2, 3].map((i) => (
							<SkeletonRow key={i} />
						))}
					</div>
				) : portfolio.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral/40">
						<Wallet size={40} strokeWidth={1.2} />
						<p className="text-sm font-medium">No assets yet</p>
						<p className="text-xs">Buy some crypto to get started</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="table w-full">
							<thead>
								<tr className="border-b border-base-200 text-neutral/40 text-xs uppercase tracking-widest">
									<th className="bg-transparent font-medium py-4 pl-5">
										Asset
									</th>
									<th className="bg-transparent font-medium py-4 text-right">
										Quantity
									</th>
									<th className="bg-transparent font-medium py-4 text-right hidden sm:table-cell">
										Current Price
									</th>
									<th className="bg-transparent font-medium py-4 text-right hidden md:table-cell">
										Total Value
									</th>
									<th className="bg-transparent font-medium py-4 text-right pr-5">
										24h Change
									</th>
								</tr>
							</thead>
							<tbody>
								{portfolio.map((row) => (
									<tr
										key={row.crypto.id}
										className="border-b border-base-200 last:border-0 hover:bg-base-50 transition-colors"
									>
										<td className="py-4 pl-5">
											<div className="flex items-center gap-3">
												<CryptoAvatar abbr={row.crypto.abbreviation} />
												<div>
													<p className="font-semibold text-neutral text-sm">
														{row.crypto.name}
													</p>
													<p className="text-xs text-neutral/40 font-medium">
														{row.crypto.abbreviation}
													</p>
												</div>
											</div>
										</td>

										<td className="py-4 text-right text-sm text-neutral font-medium">
											{fmt(row.holdings, 4)}
										</td>

										<td className="py-4 text-right text-sm text-neutral hidden sm:table-cell">
											{formatEur(latestPrice(row.crypto))}
										</td>

										<td className="py-4 text-right text-sm text-neutral font-medium hidden md:table-cell">
											{formatEur(row.valueEur)}
										</td>

										<td className="py-4 pr-5 text-right">
											<PnlBadge change24h={row.change24h} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
