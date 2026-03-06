import type { Crypto, PortfolioRow, Transaction, User } from "../lib/types";

// Check if user is admin, return primary role
export function getPrimaryRole(user: User): "user" | "admin" {
  // Return admin if ROLE_ADMIN exists, else user
  return user.roles.includes("ROLE_ADMIN") ? "admin" : "user";
}

// Get first letter of first and last name
export function getInitials(user: User) {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}

// Format number as EUR currency with 2 decimals
export function formatEur(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

// Get most recent price from crypto prices array
export function latestPrice(crypto: Crypto): number {
  // Return 0 if no prices available
  if (!crypto.prices?.length) return 0;
  const sorted = [...crypto.prices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return parseFloat(sorted[0].value);
}

// Get price from 24 hours ago or oldest available
export function price24hAgo(crypto: Crypto): number {
  // Return 0 if no prices exist
  if (!crypto.prices.length) return 0;
  const sorted = [...crypto.prices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  // Find price older than 24h, fallback to oldest
  const old = sorted.find((p) => new Date(p.date).getTime() <= cutoff);
  return parseFloat((old ?? sorted[sorted.length - 1]).value);
}

// Calculate portfolio with holdings, values, 24h changes
export function buildPortfolio(
  transactions: Transaction[],
  cryptos: Crypto[],
): PortfolioRow[] {
  const holdings: Record<number, number> = {};
  // Sum buy/sell amounts for each crypto
  for (const tx of transactions) {
    const id = tx.crypto.id;
    const amount = parseFloat(tx.amount);
    holdings[id] = (holdings[id] ?? 0) + (tx.type === "buy" ? amount : -amount);
  }

  return cryptos
    .map((crypto) => {
      const held = holdings[crypto.id] ?? 0;
      // Skip cryptos with zero or negative holdings
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

// Calculate EUR value of a transaction
export function txEurValue(tx: Transaction): number {
  return parseFloat(tx.amount) * parseFloat(tx.price.value);
}

// Sum EUR value of transactions from last 24 hours
export function get24hVolume(transactions: Transaction[]): number {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return transactions
    .filter((tx) => new Date(tx.date).getTime() >= cutoff) // Filter last 24h
    .reduce((sum, tx) => sum + txEurValue(tx), 0);
}

/**
 * User has no createdAt, so we always use the growth-curve fallback,
 * rendering a smooth chart based on total user count.
 */
// Build 30-day user growth chart data by day buckets
export function buildGrowthData(
  users: User[],
): { day: string; users: number }[] {
  const days = 30;
  const now = new Date();
  const buckets: Record<string, number> = {};

  // Initialize buckets for each day of last 30 days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets[d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })] =
      0;
  }

  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  // Count user registrations per day
  for (const user of users) {
    const d = new Date(user.createdAt);
    // Skip users created before 30-day window
    if (d < cutoff) continue;
    const key = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    // Increment bucket if day exists
    if (key in buckets) buckets[key]++;
  }

  return Object.entries(buckets).map(([day, count]) => ({ day, users: count }));
}

/**
 * Derive 24h change from a crypto's prices array.
 * Compares the most recent price to the one closest to 24h before it.
 */
// Calculate 24h price change percentage for crypto
function cryptoChange24h(crypto: Crypto): number {
  // Return 0 if insufficient price history
  if (!crypto.prices || crypto.prices.length < 2) return 0;
  const sorted = [...crypto.prices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const latest = parseFloat(sorted[0].value);
  const cutoff = new Date(sorted[0].date).getTime() - 24 * 60 * 60 * 1000;
  // Find price closest to 24h ago
  const prev = sorted.find((p) => new Date(p.date).getTime() <= cutoff);
  // Return 0 if no historical price found
  if (!prev) return 0;
  const prevVal = parseFloat(prev.value);
  // Avoid division by zero
  if (prevVal === 0) return 0;
  return ((latest - prevVal) / prevVal) * 100;
}

/** Top cryptos ranked by total EUR volume across all transactions */
// Get top 5 cryptos by transaction volume with 24h change
export function buildTopCryptos(
  transactions: Transaction[],
  cryptos: Crypto[],
): { crypto: Crypto; volume: number; change: number }[] {
  const volMap: Record<number, number> = {};
  // Sum EUR value for each crypto
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
    .filter((r) => r.volume > 0) // Only cryptos with trades
    .sort((a, b) => b.volume - a.volume) // Sort by volume desc
    .slice(0, 5); // Get top 5
}

// Calculate current holdings by crypto from transactions
export function buildHoldings(
  transactions: Transaction[],
): Record<number, number> {
  const map: Record<number, number> = {};
  // Accumulate buy/sell amounts for each crypto
  for (const tx of transactions) {
    const id = tx.crypto.id;
    const amount = parseFloat(tx.amount);
    map[id] = (map[id] ?? 0) + (tx.type === "buy" ? amount : -amount);
  }
  return map;
}

// Format number with specified decimal places
export function fmt(value: number, decimals = 2) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Format number as USD currency with $ prefix
export function fmtUSD(value: number) {
  return "$" + fmt(value);
}
