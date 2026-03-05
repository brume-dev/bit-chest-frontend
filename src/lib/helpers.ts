import type { Crypto, PortfolioRow, Transaction, User } from "../lib/types";

export function getPrimaryRole(user: User): "user" | "admin" {
	return user.roles.includes("ROLE_ADMIN") ? "admin" : "user";
}

export function getInitials(user: User) {
	return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}

export function formatEur(value: number) {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
	}).format(value);
}

export function latestPrice(crypto: Crypto): number {
	if (!crypto.prices.length) return 0;
	const sorted = [...crypto.prices].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
	return parseFloat(sorted[0].value);
}

export function price24hAgo(crypto: Crypto): number {
	if (!crypto.prices.length) return 0;
	const sorted = [...crypto.prices].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
	const cutoff = Date.now() - 24 * 60 * 60 * 1000;
	const old = sorted.find((p) => new Date(p.date).getTime() <= cutoff);
	return parseFloat((old ?? sorted[sorted.length - 1]).value);
}

export function buildPortfolio(
	transactions: Transaction[],
	cryptos: Crypto[],
): PortfolioRow[] {
	const holdings: Record<number, number> = {};
	for (const tx of transactions) {
		const id = tx.crypto.id;
		const amount = parseFloat(tx.amount);
		holdings[id] = (holdings[id] ?? 0) + (tx.type === "buy" ? amount : -amount);
	}

	return cryptos
		.map((crypto) => {
			const held = holdings[crypto.id] ?? 0;
			if (held <= 0) return null;
			const current = latestPrice(crypto);
			const yesterday = price24hAgo(crypto);
			const change24h =
				yesterday > 0 ? ((current - yesterday) / yesterday) * 100 : 0;
			return {
				crypto,
				holdings: held,
				valueEur: held * current,
				change24h,
			} satisfies PortfolioRow;
		})
		.filter(Boolean) as PortfolioRow[];
}

export function txEurValue(tx: Transaction): number {
	return parseFloat(tx.amount) * parseFloat(tx.price.value);
}

export function get24hVolume(transactions: Transaction[]): number {
	const cutoff = Date.now() - 24 * 60 * 60 * 1000;
	return transactions
		.filter((tx) => new Date(tx.date).getTime() >= cutoff)
		.reduce((sum, tx) => sum + txEurValue(tx), 0);
}

/**
 * User has no createdAt, so we always use the growth-curve fallback,
 * rendering a smooth chart based on total user count.
 */
export function buildGrowthData(
	users: User[],
): { day: string; users: number }[] {
	const days = 30;
	const now = new Date();
	const buckets: Record<string, number> = {};

	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		buckets[d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })] =
			0;
	}

	const cutoff = new Date(now);
	cutoff.setDate(cutoff.getDate() - days);

	for (const user of users) {
		const d = new Date(user.createdAt);
		if (d < cutoff) continue;
		const key = d.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
		});
		if (key in buckets) buckets[key]++;
	}

	return Object.entries(buckets).map(([day, count]) => ({ day, users: count }));
}

/**
 * Derive 24h change from a crypto's prices array.
 * Compares the most recent price to the one closest to 24h before it.
 */
function cryptoChange24h(crypto: Crypto): number {
	if (!crypto.prices || crypto.prices.length < 2) return 0;
	const sorted = [...crypto.prices].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
	const latest = parseFloat(sorted[0].value);
	const cutoff = new Date(sorted[0].date).getTime() - 24 * 60 * 60 * 1000;
	const prev = sorted.find((p) => new Date(p.date).getTime() <= cutoff);
	if (!prev) return 0;
	const prevVal = parseFloat(prev.value);
	if (prevVal === 0) return 0;
	return ((latest - prevVal) / prevVal) * 100;
}

/** Top cryptos ranked by total EUR volume across all transactions */
export function buildTopCryptos(
	transactions: Transaction[],
	cryptos: Crypto[],
): { crypto: Crypto; volume: number; change: number }[] {
	const volMap: Record<number, number> = {};
	for (const tx of transactions) {
		const id = tx.crypto.id;
		volMap[id] = (volMap[id] ?? 0) + txEurValue(tx);
	}
	return cryptos
		.map((c) => ({
			crypto: c,
			volume: volMap[c.id] ?? 0,
			change: cryptoChange24h(c),
		}))
		.filter((r) => r.volume > 0)
		.sort((a, b) => b.volume - a.volume)
		.slice(0, 5);
}
