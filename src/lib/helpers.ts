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
  const sorted = [...crypto.prices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return parseFloat(sorted[0].value);
}

export function price24hAgo(crypto: Crypto): number {
  if (!crypto.prices.length) return 0;
  const sorted = [...crypto.prices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const old = sorted.find((p) => new Date(p.date).getTime() <= cutoff);
  return parseFloat((old ?? sorted[sorted.length - 1]).value);
}

export function buildPortfolio(transactions: Transaction[], cryptos: Crypto[]): PortfolioRow[] {
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
      const change24h = yesterday > 0 ? ((current - yesterday) / yesterday) * 100 : 0;
      return {
        crypto,
        holdings: held,
        valueEur: held * current,
        change24h,
      } satisfies PortfolioRow;
    })
    .filter(Boolean) as PortfolioRow[];
}
