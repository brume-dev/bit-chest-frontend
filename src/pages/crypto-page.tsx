import { Search, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildTopCryptos, formatEur, latestPrice, price24hAgo } from "../lib/helpers";
import { useAllTransactions, useCryptos } from "../lib/hooks";
import type { Crypto } from "../lib/types";

// ─── Period filter ─────────────────────────────────────────────────────────────

const PERIOD_MS: Record<string, number> = {
  "1D": 24 * 60 * 60 * 1000,
  "7D": 7 * 24 * 60 * 60 * 1000,
  "1M": 30 * 24 * 60 * 60 * 1000,
  "1Y": 365 * 24 * 60 * 60 * 1000,
};

/**
 * Build chart-ready price history from crypto.prices, filtered to the period.
 * Sorts chronologically and formats the label depending on the period.
 */
// Build chart data filtered by time period
function buildPriceHistory(crypto: Crypto, period: string): { time: string; price: number }[] {
  // Return empty if no prices available
  if (!crypto.prices?.length) return [];

  const now = Date.now();
  const cutoff = now - (PERIOD_MS[period] ?? PERIOD_MS["7D"]);

  // Filter prices within period range
  const filtered = crypto.prices
    .map((p) => ({ ts: new Date(p.date).getTime(), value: parseFloat(p.value) }))
    .filter((p) => p.ts >= cutoff) // Within period
    .sort((a, b) => a.ts - b.ts); // Sort chronologically

  // Format each price point with time label
  return filtered.map(({ ts, value }) => {
    const d = new Date(ts);
    let time: string;
    // Format time label based on selected period
    if (period === "1D") {
      time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    } else if (period === "7D") {
      time = d.toLocaleDateString("en-GB", { weekday: "short" });
    } else if (period === "1M") {
      time = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    } else {
      time = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    }
    return { time, price: value };
  });
}

/**
 * Build volume distribution chart data from top cryptos' price history.
 * Uses each crypto's last 7 price points as the trend line.
 */
// Build volume distribution from top cryptos
function buildVolumeChartData(topCryptos: { crypto: Crypto; volume: number }[]): Record<string, string | number>[] {
  const allPoints: { ts: number; label: string; cryptoId: number; value: number }[] = [];

  // Collect all price points for top cryptos
  for (const { crypto } of topCryptos) {
    // Skip if no prices available
    if (!crypto.prices?.length) continue;
    // Get last 7 price points for trend
    const sorted = [...crypto.prices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
    // Iterate over sorted prices
    for (const p of sorted) {
      const ts = new Date(p.date).getTime();
      allPoints.push({
        ts,
        label: new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        cryptoId: crypto.id,
        value: parseFloat(p.value),
      });
    }
  }

  const byLabel: Record<string, Record<string, number>> = {};
  // Group points by label (date)
  for (const pt of allPoints) {
    // Find matching crypto from top list
    const crypto = topCryptos.find((r) => r.crypto.id === pt.cryptoId)?.crypto;
    // Skip if crypto not found
    if (!crypto) continue;
    // Initialize label bucket if new
    if (!byLabel[pt.label]) byLabel[pt.label] = {};
    byLabel[pt.label][crypto.name] = pt.value;
  }

  // Convert to array and sort chronologically
  return Object.entries(byLabel)
    .sort(([a], [b]) => {
      // Find timestamps for sorting comparison
      const tsA = allPoints.find((p) => p.label === a)?.ts ?? 0;
      const tsB = allPoints.find((p) => p.label === b)?.ts ?? 0;
      return tsA - tsB;
    })
    .map(([label, values]) => ({ time: label, ...values }));
}

// ─── Sub-components ────────────────────────────────────────────────────────────

// Display crypto stat card with name and change
function StatCard({ crypto }: { crypto: Crypto }) {
  const price = latestPrice(crypto);
  const prev = price24hAgo(crypto);
  const change = prev > 0 ? ((price - prev) / prev) * 100 : 0;
  // Determine if change is positive
  const isPositive = change >= 0;

  return (
    <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500 font-medium">
        {crypto.name} ({crypto.symbol ?? ""})
      </p>
      <p className="text-2xl font-bold text-neutral mt-1">{formatEur(price)}</p>
      <span
        className={`text-xs font-semibold flex items-center gap-1 mt-1 ${isPositive ? "text-success" : "text-error"}`}
      >
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isPositive ? "+" : ""}
        {change.toFixed(2)}%
      </span>
    </div>
  );
}

// Format percentage change display
function ChangeCell({ value }: { value: number }) {
  // Determine if positive or negative
  const isPositive = value >= 0;
  return (
    <span className={`font-semibold ${isPositive ? "text-success" : "text-error"}`}>
      {isPositive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

// Format number as currency with EUR suffix
function formatVolume(n: number) {
  // Convert to appropriate magnitude
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T €`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B €`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M €`;
  return formatEur(n);
}

// Display tooltip for chart with value
function PriceTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  // Hide tooltip if not active or no data
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-100 border border-base-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="font-bold text-neutral">{formatEur(payload[0].value)}</p>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const COLORS = ["#35a7ff", "#38618c", "#01ff19", "#ff5964", "#f59e0b"];

// Crypto monitoring and analytics page
export function CryptoPage() {
  const { data: cryptos = [], isLoading: loadingCryptos } = useCryptos();
  const { data: transactions = [], isLoading: loadingTx } = useAllTransactions();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("7D");

  const isLoading = loadingCryptos || loadingTx;

  // First crypto as the featured one for the performance chart
  const featured = cryptos[0] as Crypto | undefined;

  // Real price history from featured crypto's prices array, filtered by period
  const priceHistory = useMemo(() => (featured ? buildPriceHistory(featured, period) : []), [featured, period]);

  // Top 5 cryptos by EUR transaction volume
  const topCryptos = useMemo(() => buildTopCryptos(transactions, cryptos), [transactions, cryptos]);

  // Volume distribution chart built from real price history of top cryptos
  const volumeChartData = useMemo(() => buildVolumeChartData(topCryptos), [topCryptos]);

  // Filter cryptos by search term
  const filtered = cryptos.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral">Crypto Monitoring</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Cryptocurrency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm pl-9 w-64 text-sm bg-base-100 rounded-full"
          />
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
          : cryptos.slice(0, 4).map((c) => <StatCard key={c.id} crypto={c} />)}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Performance */}
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm lg:col-span-3">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-semibold text-neutral">
                {featured ? `${featured.name} (${featured.symbol ?? ""}) Performance` : "Performance"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Price trend over the selected period.</p>
            </div>
            <div className="flex gap-1">
              {Object.keys(PERIOD_MS).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`btn btn-xs rounded-lg border-none ${period === p ? "btn-secondary text-white" : "btn-ghost text-gray-400"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="skeleton h-[220px] rounded-xl" />
          ) : priceHistory.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
              No price data for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={priceHistory} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#35a7ff" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#35a7ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip content={<PriceTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#35a7ff"
                  strokeWidth={2.5}
                  fill="url(#priceGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#35a7ff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Volume Distribution */}
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm lg:col-span-2">
          <p className="font-semibold text-neutral">Volume Distribution</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-2">Top 5 by 24h volume.</p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
            {topCryptos.map(({ crypto }, i) => (
              <span key={crypto.id} className="flex items-center gap-1 text-xs text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {crypto.symbol ?? crypto.name}
              </span>
            ))}
          </div>

          {isLoading ? (
            <div className="skeleton h-[180px] rounded-xl" />
          ) : volumeChartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">No data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={volumeChartData} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number, name: string) => [formatEur(value), name]}
                  contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid #e5e7eb" }}
                />
                {topCryptos.map(({ crypto }, i) => (
                  <Line
                    key={crypto.id}
                    type="monotone"
                    dataKey={crypto.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
        <h2 className="font-semibold text-neutral mb-4">Supported Cryptocurrencies</h2>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-base-200">
                <th className="w-10 font-semibold pb-3">#</th>
                <th className="font-semibold pb-3">Name</th>
                <th className="font-semibold pb-3">Price</th>
                <th className="font-semibold pb-3">24H Change</th>
                <th className="font-semibold pb-3">24H Volume</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={5}>
                      <div className="skeleton h-8 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
                : filtered.map((c, idx) => {
                  const price = latestPrice(c);
                  const prev = price24hAgo(c);
                  const change = prev > 0 ? ((price - prev) / prev) * 100 : 0;
                  const txVolume = topCryptos.find((r) => r.crypto.id === c.id)?.volume ?? 0;

                  return (
                    <tr key={c.id} className="border-b border-base-100 hover:bg-slate-50 transition-colors">
                      <td className="text-gray-400 text-sm py-3">{idx + 1}</td>
                      <td className="py-3">
                        <span className="font-semibold text-neutral text-sm">
                          {c.name} ({c.symbol ?? ""})
                        </span>
                      </td>
                      <td className="py-3 text-sm font-medium text-neutral">{formatEur(price)}</td>
                      <td className="py-3 text-sm">
                        <ChangeCell value={change} />
                      </td>
                      <td className="py-3 text-sm text-gray-600">{formatVolume(txVolume)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No cryptocurrencies found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
