import { Bitcoin, CircleDollarSign, TrendingUp, Wallet } from "lucide-react";
import { Link, useOutletContext } from "react-router";
import { ChangeCell } from "../components/dashboard-change-cell";
import { CryptoIcon } from "../components/dashboard-crypto-icon";
import { StatCard } from "../components/dashboard-stat-card";
import { buildPortfolio, formatEur } from "../lib/helpers";
import { useCryptos, useTransactions } from "../lib/hooks";
import type { User } from "../lib/types";

export function DashboardPage() {
  const user = useOutletContext<User>();

  const { data: cryptos = [], isLoading: cryptosLoading } = useCryptos();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();

  const isLoading = cryptosLoading || txLoading;

  const portfolio = buildPortfolio(transactions, cryptos);
  const totalPortfolioEur = portfolio.reduce((s, r) => s + r.valueEur, 0);
  const cashBalance = parseFloat(user.balance);
  const totalBalance = totalPortfolioEur + cashBalance;

  const portfolioDelta = portfolio.reduce((s, r) => {
    const prev = r.valueEur / (1 + r.change24h / 100);
    return s + (r.valueEur - prev);
  }, 0);
  const portfolioDeltaPct = totalBalance > 0 ? (portfolioDelta / (totalBalance - portfolioDelta)) * 100 : 0;

  return (
    <div className="flex bg-slate-50 font-sans">
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral">Welcome back, {user.firstName}!</h1>
              <p className="text-sm text-base-content/50 mt-0.5">Here's what's happening with your portfolio today.</p>
            </div>
            <Link to="/deposit" className="btn btn-secondary text-white border-none btn-sm sm:btn-md">
              Deposit / Withdraw
            </Link>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Wallet size={18} />}
              label="Total Balance"
              value={formatEur(totalBalance)}
              sub={`${portfolioDelta >= 0 ? "+" : ""}${formatEur(portfolioDelta)} (${portfolioDeltaPct.toFixed(2)}%) today`}
              positive={portfolioDelta >= 0}
            />
            <StatCard icon={<TrendingUp size={18} />} label="Portfolio Value" value={formatEur(totalPortfolioEur)} />
            <StatCard icon={<CircleDollarSign size={18} />} label="Cash Balance (EUR)" value={formatEur(cashBalance)} />
          </div>

          {/* ── Portfolio table ── */}
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-0">
              <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
                <h2 className="font-bold text-neutral text-lg flex items-center gap-2">
                  <Bitcoin size={18} className="text-secondary" />
                  My Portfolio
                </h2>
                <Link to="/trade" className="btn btn-ghost btn-xs text-secondary">
                  View all
                </Link>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <span className="loading loading-spinner loading-md text-secondary" />
                </div>
              ) : portfolio.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-base-content/40">
                  <Bitcoin size={40} />
                  <p className="text-sm">No assets yet. Start trading!</p>
                  <Link to="/trade" className="btn btn-secondary btn-sm text-white border-none">
                    Buy crypto
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="text-xs text-base-content/40 uppercase tracking-wider">
                        <th className="pl-6">Asset</th>
                        <th>Balance</th>
                        <th>Value (EUR)</th>
                        <th>24h Change</th>
                        <th className="pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((row) => (
                        <tr key={row.crypto.id} className="hover:bg-base-200/40 transition-colors">
                          <td className="pl-6">
                            <div className="flex items-center gap-3">
                              <CryptoIcon abbreviation={row.crypto.abbreviation} />
                              <div>
                                <p className="font-semibold text-sm text-neutral">{row.crypto.name}</p>
                                <p className="text-xs text-base-content/40">{row.crypto.abbreviation}</p>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="text-sm font-medium text-base-content">
                              {row.holdings.toLocaleString("fr-FR", { maximumFractionDigits: 8 })}{" "}
                              <span className="text-base-content/40 text-xs">{row.crypto.abbreviation}</span>
                            </span>
                          </td>

                          <td>
                            <span className="text-sm font-semibold text-neutral">{formatEur(row.valueEur)}</span>
                          </td>

                          <td>
                            <ChangeCell pct={row.change24h} />
                          </td>

                          <td className="pr-6 text-right">
                            <Link
                              to={`/trade/${row.crypto.id}`}
                              className="btn btn-secondary btn-sm text-white border-none"
                            >
                              Trade
                            </Link>
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
