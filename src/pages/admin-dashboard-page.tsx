import { Activity, AlertCircle, AlertTriangle, Bitcoin, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "../components/chart-tooltip";
import { ChangeCell } from "../components/dashboard-change-cell";
import { CryptoIcon } from "../components/dashboard-crypto-icon";
import { StatCard } from "../components/dashboard-stat-card";
import { buildGrowthData, buildTopCryptos, formatEur, get24hVolume, txEurValue } from "../lib/helpers";
import { useCryptos, useTransactions, useUsers } from "../lib/hooks";

// ── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="alert alert-error text-sm">
      <AlertTriangle size={16} />
      <span>{message}</span>
    </div>
  );
}

// ── Section skeleton ──────────────────────────────────────────────────────────

function CardSkeleton({ className = "" }: { className?: string }) {
  return <div className={`card bg-base-100 border border-base-200 shadow-sm animate-pulse ${className}`} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { data: users, isLoading: usersLoading, isError: usersError, error: usersErrorMsg } = useUsers();

  const { data: transactions, isLoading: txLoading, isError: txError, error: txErrorMsg } = useTransactions();

  const { data: cryptos, isLoading: cryptosLoading, isError: cryptosError, error: cryptosErrorMsg } = useCryptos();

  // ── Guard: only compute derived data when all queries have resolved successfully ──
  const isLoading = usersLoading || txLoading || cryptosLoading;
  const hasError = usersError || txError || cryptosError;
  const isReady = !isLoading && !hasError && users !== undefined && transactions !== undefined && cryptos !== undefined;

  // Derived stats — only computed when isReady, never on undefined data
  const totalClients = isReady ? users.length : 0;
  const volume24h = isReady ? get24hVolume(transactions) : 0;
  const growthData = isReady ? buildGrowthData(users) : [];
  const topCryptos = isReady ? buildTopCryptos(transactions, cryptos) : [];
  const monthSignups = growthData.reduce((s, d) => s + d.users, 0);
  const growthPct =
    growthData.length > 1
      ? ((growthData.at(-1)!.users - growthData[0].users) / Math.max(growthData[0].users, 1)) * 100
      : 0;
  const totalBuys = isReady ? transactions.filter((tx) => tx.type === "buy").length : 0;
  const totalSells = isReady ? transactions.filter((tx) => tx.type === "sell").length : 0;
  const recentActivity = isReady
    ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
    : [];

  return (
    <div className="flex bg-slate-50 font-sans min-h-screen">
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* ── Header ── */}
          <div>
            <h1 className="text-2xl font-bold text-neutral">Admin Dashboard</h1>
            <p className="text-sm text-base-content/50 mt-0.5">Platform overview and activity monitor.</p>
          </div>

          {/* ── Error banners — one per failing query ── */}
          {usersError && <ErrorBanner message={`Failed to load users: ${usersErrorMsg?.message ?? "Unknown error"}`} />}
          {txError && (
            <ErrorBanner message={`Failed to load transactions: ${txErrorMsg?.message ?? "Unknown error"}`} />
          )}
          {cryptosError && (
            <ErrorBanner message={`Failed to load cryptos: ${cryptosErrorMsg?.message ?? "Unknown error"}`} />
          )}

          {/* ── Stat cards ── */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <CardSkeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Users size={18} />}
                label="Total Active Clients"
                value={usersError ? "—" : totalClients.toLocaleString()}
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="24h Trading Volume"
                value={txError ? "—" : formatEur(volume24h)}
                sub={!txError && volume24h > 0 ? "+2.5% vs yesterday" : undefined}
                positive={true}
              />
              <StatCard
                icon={<Activity size={18} />}
                label="Total Transactions"
                value={txError ? "—" : transactions!.length.toLocaleString()}
                sub={!txError ? `${totalBuys} buys · ${totalSells} sells` : "Could not load"}
                positive={!txError}
              />
              <StatCard
                icon={<AlertCircle size={18} />}
                label="Open Support Tickets"
                value="12"
                sub="3 High Priority"
                positive={false}
              />
            </div>
          )}

          {/* ── Chart + Top Cryptos ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Growth Chart */}
            <div className="card bg-base-100 border border-base-200 shadow-sm lg:col-span-2">
              <div className="card-body p-5">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-base-content/50 uppercase tracking-wider">Client Growth</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-neutral">
                      {usersLoading || usersError ? "—" : `${monthSignups.toLocaleString()} New Users`}
                    </span>
                    {isReady && (
                      <span className={`text-sm font-bold ${growthPct >= 0 ? "text-success" : "text-error"}`}>
                        {growthPct >= 0 ? "+" : ""}
                        {growthPct.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-base-content/40 mt-0.5">Last 30 Days</p>
                </div>

                {isLoading ? (
                  <div className="h-52 flex items-center justify-center">
                    <span className="loading loading-spinner loading-md text-secondary" />
                  </div>
                ) : usersError ? (
                  <div className="h-52 flex items-center justify-center gap-2 text-error text-sm">
                    <AlertTriangle size={16} />
                    Could not load growth data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={210}>
                    <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#35a7ff" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#35a7ff" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#35a7ff"
                        strokeWidth={2.5}
                        fill="url(#growthGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#35a7ff", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Cryptos by Volume */}
            <div className="card bg-base-100 border border-base-200 shadow-sm">
              <div className="card-body p-5">
                <h2 className="font-bold text-neutral text-base flex items-center gap-2 mb-4">
                  <Bitcoin size={16} className="text-secondary" />
                  Top Cryptos by Volume
                </h2>

                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                      <div key={i} className="h-10 bg-base-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : txError || cryptosError ? (
                  <div className="flex items-center justify-center gap-2 text-error text-sm py-8">
                    <AlertTriangle size={16} />
                    Could not load data
                  </div>
                ) : topCryptos.length === 0 ? (
                  <p className="text-sm text-base-content/40 text-center py-8">No trading data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topCryptos.map(({ crypto, volume, change }) => (
                      <div key={crypto.id} className="flex items-center gap-3">
                        <CryptoIcon abbreviation={crypto.abbreviation} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral leading-none truncate">{crypto.name}</p>
                          <p className="text-xs text-base-content/40 mt-0.5">{crypto.abbreviation}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-neutral">{formatEur(volume)}</p>
                          <ChangeCell pct={change} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Recent Client Activity ── */}
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-0">
              <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
                <h2 className="font-bold text-neutral text-lg flex items-center gap-2">
                  <Activity size={18} className="text-secondary" />
                  Recent Client Activity
                </h2>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <span className="loading loading-spinner loading-md text-secondary" />
                </div>
              ) : txError || cryptosError ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-error">
                  <AlertTriangle size={36} />
                  <p className="text-sm">Could not load recent activity.</p>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-base-content/40">
                  <Activity size={36} />
                  <p className="text-sm">No transactions recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="text-xs text-base-content/40 uppercase tracking-wider">
                        <th className="pl-6">Asset</th>
                        <th>Action</th>
                        <th>Amount</th>
                        <th>EUR Value</th>
                        <th>Timestamp</th>
                        <th className="pr-6 text-right">Price / unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((tx) => (
                        <tr key={tx.id} className="hover:bg-base-200/40 transition-colors">
                          <td className="pl-6">
                            <div className="flex items-center gap-2">
                              <CryptoIcon abbreviation={tx.crypto.abbreviation} />
                              <div>
                                <p className="text-sm font-semibold text-neutral">{tx.crypto.name}</p>
                                <p className="text-xs text-base-content/40">{tx.crypto.abbreviation}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge badge-sm font-semibold capitalize ${tx.type === "buy" ? "badge-success" : "badge-error"}`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm font-medium text-neutral">
                              {parseFloat(tx.amount).toLocaleString("fr-FR", {
                                maximumFractionDigits: 8,
                              })}{" "}
                              <span className="text-base-content/40 text-xs">{tx.crypto.abbreviation}</span>
                            </span>
                          </td>
                          <td>
                            <span className="text-sm font-semibold text-neutral">{formatEur(txEurValue(tx))}</span>
                          </td>
                          <td>
                            <span className="text-sm text-base-content/50">
                              {new Date(tx.date).toLocaleString("en-GB", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          </td>
                          <td className="pr-6 text-right">
                            <span className="text-sm text-base-content/60">
                              {formatEur(parseFloat(tx.price.value))}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
