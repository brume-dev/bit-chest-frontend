// src/pages/trades-page.tsx

import { ArrowDownUp, Bitcoin, CheckCircle, CircleDollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { buildHoldings, latestPrice } from "../lib/helpers";
import { useCreateTransaction, useCrypto, useCryptos, useCurrentUser, useTransactions } from "../lib/hooks";

type Tab = "buy" | "sell";

interface PreviewData {
  tab: Tab;
  cryptoId: number;
  priceId: number;
  cryptoName: string;
  cryptoAbbreviation: string;
  currentPrice: number;
  amountUsd: number;
  cryptoQty: number;
}

export function TradesPage() {
  const { data: user } = useCurrentUser();
  const { data: cryptos = [] } = useCryptos();
  const { data: transactions = [] } = useTransactions();
  const createTransaction = useCreateTransaction();

  const [tab, setTab] = useState<Tab>("buy");
  const [selectedCryptoId, setSelectedCryptoId] = useState<number>(0);
  const [amountStr, setAmountStr] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Fetch the full crypto (with prices) only when one is selected
  const { data: selectedCrypto, isLoading: priceLoading } = useCrypto(selectedCryptoId);

  const holdings = useMemo(() => buildHoldings(transactions), [transactions]);

  const currentPrice = selectedCrypto ? latestPrice(selectedCrypto) : 0;

  const latestPriceEntry = useMemo(() => {
    if (!selectedCrypto?.prices?.length) return null;
    return [...selectedCrypto.prices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [selectedCrypto]);

  const amount = Number.parseFloat(amountStr) || 0;
  const cryptoQty = currentPrice > 0 && amount > 0 ? amount / currentPrice : 0;
  const usdBalance = Number.parseFloat(user?.balance ?? "0");
  const selectedHolding = selectedCryptoId > 0 ? (holdings[selectedCryptoId] ?? 0) : 0;
  const selectedHoldingValue = currentPrice > 0 ? selectedHolding * currentPrice : 0;

  function handlePreview() {
    if (!selectedCrypto || !latestPriceEntry || amount <= 0) return;
    setPreview({
      tab,
      cryptoId: selectedCrypto.id,
      priceId: latestPriceEntry.id,
      cryptoName: selectedCrypto.name,
      cryptoAbbreviation: selectedCrypto.abbreviation.toUpperCase(),
      currentPrice,
      amountUsd: amount,
      cryptoQty,
    });
    setConfirmed(false);
  }

  function handleConfirm() {
    if (!preview) return;
    createTransaction.mutate(
      {
        cryptoId: preview.cryptoId,
        priceId: preview.priceId,
        amount: preview.amountUsd,
        type: preview.tab,
      },
      {
        onSuccess: () => {
          setConfirmed(true);
          setAmountStr("");
          setSelectedCryptoId(0);
        },
      },
    );
  }

  function handleReset() {
    setPreview(null);
    setConfirmed(false);
    setAmountStr("");
    createTransaction.reset();
  }

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    setPreview(null);
    setAmountStr("");
  }

  const canPreview = !!selectedCrypto && !!latestPriceEntry && amount > 0 && !priceLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50">
      <h1 className="text-2xl font-bold text-neutral mb-6">Buy &amp; Sell Crypto</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left: Trade Form ── */}
        <div className="flex-1 min-w-0">
          <div className="bg-base-100 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                type="button"
                onClick={() => handleTabChange("buy")}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  tab === "buy"
                    ? "text-secondary border-b-2 border-secondary bg-blue-50/50"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <TrendingUp size={15} />
                Buy
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("sell")}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  tab === "sell"
                    ? "text-error border-b-2 border-error bg-red-50/50"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <TrendingDown size={15} />
                Sell
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Crypto selector */}
              <div className="form-control w-full">
                <label htmlFor="crypto" className="label pt-0 pb-1">
                  <span className="label-text text-xs font-semibold text-gray-500">Select Cryptocurrency</span>
                </label>
                <select
                  id="crypto"
                  className="select select-bordered w-full text-sm"
                  value={selectedCryptoId || ""}
                  onChange={(e) => {
                    setSelectedCryptoId(e.target.value ? Number(e.target.value) : 0);
                    setPreview(null);
                    setAmountStr("");
                  }}
                >
                  <option value="">Choose a crypto...</option>
                  {cryptos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.abbreviation.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="form-control w-full">
                <label htmlFor="amount" className="label pt-0 pb-1">
                  <span className="label-text text-xs font-semibold text-gray-500">
                    Amount to {tab === "buy" ? "Spend" : "Sell"} (USD)
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amountStr}
                    onChange={(e) => {
                      setAmountStr(e.target.value);
                      setPreview(null);
                    }}
                    className="input input-bordered w-full pr-14 text-sm tabular-nums"
                  />
                  <span className="absolute right-4 inset-y-0 flex items-center text-xs font-semibold text-gray-400 pointer-events-none">
                    USD
                  </span>
                </div>
              </div>

              {/* Live summary */}
              {selectedCryptoId > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                  {priceLoading ? (
                    <div className="flex justify-center py-1">
                      <span className="loading loading-spinner loading-sm text-secondary" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-500">
                        <span>Current Price</span>
                        <span className="font-medium text-neutral tabular-nums">
                          1 {selectedCrypto?.abbreviation.toUpperCase()} ={" "}
                          {currentPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </span>
                      </div>
                      {amount > 0 && (
                        <div className="flex justify-between font-bold text-neutral border-t border-slate-200 pt-2">
                          <span>You will {tab === "buy" ? "receive" : "sell"}</span>
                          <span className="tabular-nums">
                            ≈ {cryptoQty.toFixed(6)} {selectedCrypto?.abbreviation.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* API Error */}
              {createTransaction.error && (
                <p className="text-error text-xs text-center font-medium">{createTransaction.error.message}</p>
              )}

              {/* CTA */}
              <button
                type="button"
                disabled={!canPreview}
                onClick={handlePreview}
                className={`btn w-full text-white border-none ${
                  tab === "buy" ? "btn-secondary" : "btn-error"
                } disabled:bg-gray-200 disabled:text-gray-400`}
              >
                {tab === "buy" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                Preview {tab === "buy" ? "Buy" : "Sell"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Wallet + Preview ── */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
          {/* Wallet card */}
          <div className="bg-base-100 rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-bold text-neutral mb-3 flex items-center gap-2">
              <ArrowDownUp size={14} className="text-secondary" />
              Your Wallet
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CircleDollarSign size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">USD Balance</p>
                  <p className="text-sm font-bold text-neutral tabular-nums">
                    {usdBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </p>
                </div>
              </div>

              {selectedCrypto && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Bitcoin size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      {selectedCrypto.abbreviation.toUpperCase()} Balance
                    </p>
                    <p className="text-sm font-bold text-neutral tabular-nums">
                      {selectedHolding.toFixed(6)} {selectedCrypto.abbreviation.toUpperCase()}
                    </p>
                    {selectedHoldingValue > 0 && (
                      <p className="text-xs text-gray-400 tabular-nums">
                        ≈ {selectedHoldingValue.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Preview panel */}
          {preview && (
            <div
              className={`bg-base-100 rounded-2xl shadow-sm border overflow-hidden ${
                confirmed ? "border-success/40" : preview.tab === "buy" ? "border-secondary/30" : "border-error/30"
              }`}
            >
              <div
                className={`px-5 py-3 text-xs font-bold uppercase tracking-wider ${
                  confirmed
                    ? "bg-success/10 text-success"
                    : preview.tab === "buy"
                      ? "bg-blue-50 text-secondary"
                      : "bg-red-50 text-error"
                }`}
              >
                Transaction Preview
              </div>

              <div className="p-5 space-y-3">
                {confirmed ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <CheckCircle size={36} className="text-success" />
                    <p className="text-sm font-bold text-neutral">Transaction Submitted!</p>
                    <p className="text-xs text-gray-400">
                      Your {preview.tab} order for {preview.cryptoAbbreviation} has been placed.
                    </p>
                    <button type="button" onClick={handleReset} className="btn btn-sm btn-ghost mt-2 text-xs">
                      Make another trade
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      You are about to{" "}
                      <span className={`font-bold ${preview.tab === "buy" ? "text-secondary" : "text-error"}`}>
                        {preview.tab}
                      </span>{" "}
                      <span className="font-semibold text-neutral">
                        {preview.amountUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </span>{" "}
                      and {preview.tab === "buy" ? "receive approximately" : "sell approximately"}{" "}
                      <span className="font-semibold text-neutral">
                        {preview.cryptoQty.toFixed(6)} {preview.cryptoAbbreviation}
                      </span>
                      .
                    </p>

                    <div className="space-y-1.5 text-xs bg-slate-50 rounded-xl p-3">
                      <div className="flex justify-between text-gray-500">
                        <span>Crypto</span>
                        <span className="font-medium text-neutral">
                          {preview.cryptoName} ({preview.cryptoAbbreviation})
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Price</span>
                        <span className="tabular-nums">
                          {preview.currentPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-neutral border-t border-slate-200 pt-1.5">
                        <span>Total</span>
                        <span className="tabular-nums">
                          {preview.amountUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={createTransaction.isPending}
                      onClick={handleConfirm}
                      className={`btn btn-sm w-full text-white border-none ${
                        preview.tab === "buy" ? "btn-secondary" : "btn-error"
                      } disabled:bg-gray-200`}
                    >
                      {createTransaction.isPending ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Confirm {preview.tab === "buy" ? "Purchase" : "Sale"}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="btn btn-sm btn-ghost w-full text-xs text-gray-400"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
