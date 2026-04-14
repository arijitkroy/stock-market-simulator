import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, 
  Zap, X, Check, Loader2 
} from "lucide-react";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeSell, setActiveSell] = useState(null); 
  const [sellQty, setSellQty] = useState("");
  const [processingSell, setProcessingSell] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/trade";
        return;
      }

      const res = await fetch("/api/user/portfolio", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to fetch portfolio");
      }

      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
      if (err.message.includes("Unauthorized") || err.message.includes("not found")) {
        localStorage.removeItem("token");
        setTimeout(() => window.location.href = "/trade", 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleQuickSell = async (symbol, price) => {
    if (!sellQty || isNaN(sellQty) || Number(sellQty) <= 0) return;
    
    setProcessingSell(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/trade/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol,
          quantity: Number(sellQty),
          price: Number(price)
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setActiveSell(null);
        setSellQty("");
        fetchPortfolio();
      } else {
        alert(result.error || "Sell failed");
      }
    } catch (err) {
      alert("Transaction failed");
    } finally {
      setProcessingSell(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617] text-white">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-brand-primary animate-spin"></div>
          <div className="mt-4 text-center font-medium animate-pulse text-brand-primary uppercase tracking-widest text-xs">Syncing Portfolio...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 bg-[#020617] text-white animate-fade-in">
        <div className="glass p-8 rounded-2xl max-w-md w-full border-red-500/20 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Sync Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-brand-primary rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Reconnect Terminal
          </button>
        </div>
      </div>
    );
  }

  const totalInvestment = data.holdings.reduce((acc, h) => acc + (h.avgPrice * h.quantity), 0);
  const currentPortfolioValue = data.holdings.reduce((acc, h) => acc + (h.currentPrice * h.quantity), 0);
  const totalPL = currentPortfolioValue - totalInvestment;
  const plPercentage = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in text-white bg-[#020617]">
      <div className="bg-blob bg-blob-1"></div>
      <div className="bg-blob bg-blob-2"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass p-6 md:p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Wallet size={60} />
                </div>
                <div className="text-slate-400 text-[10px] uppercase font-black mb-1">Cash Balance</div>
                <div className="text-3xl font-black">₹{data?.balance?.toLocaleString('en-IN') || 0}</div>
                <div className="mt-4">
                    <Link href="/trade" className="inline-block text-[9px] uppercase font-black bg-brand-primary px-4 py-1.5 rounded-full hover:bg-white hover:text-black transition-all">
                        Deploy Capital
                    </Link>
                </div>
            </div>

            <div className="glass p-6 md:p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp size={60} />
                </div>
                <div className="text-slate-400 text-[10px] uppercase font-black mb-1">Portfolio Value</div>
                <div className="text-3xl font-black">₹{currentPortfolioValue.toLocaleString('en-IN')}</div>
                <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${totalPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {totalPL >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{totalPL >= 0 ? '+' : ''}₹{Math.abs(totalPL).toLocaleString('en-IN')} ({plPercentage.toFixed(2)}%)</span>
                </div>
            </div>

            <div className="glass p-6 md:p-8 rounded-[2rem] border-brand-primary/20 relative overflow-hidden group bg-brand-primary/5">
                <div className="text-slate-400 text-[10px] uppercase font-black mb-1">Net Worth</div>
                <div className="text-4xl font-black text-brand-primary">₹{(data.balance + currentPortfolioValue).toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Combined Liquidity & Assets</p>
            </div>
        </div>

        <div className="glass rounded-[2rem] overflow-hidden">
          <div className="p-6 md:p-8 pb-2 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-3">
                <h2 className="text-lg font-black uppercase tracking-widest">Active Holdings</h2>
                <span className="bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full text-[9px] font-black">{data?.holdings?.length || 0} ASSETS</span>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-visible">
            {!data?.holdings || data.holdings.length === 0 ? (
              <div className="text-center py-20 text-slate-600">
                <div className="text-5xl mb-6 opacity-20">📉</div>
                <p className="font-bold uppercase tracking-widest text-[10px]">No active positions detected.</p>
                <Link href="/trade" className="text-brand-primary text-xs font-black uppercase mt-4 inline-block hover:underline">Start Trading Now</Link>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 text-[9px] uppercase font-black border-b border-white/5">
                    <th className="px-6 py-4">Asset</th>
                    <th className="px-6 py-4">Weight</th>
                    <th className="px-6 py-4 text-right">Avg / Current</th>
                    <th className="px-6 py-4 text-right">Market Value</th>
                    <th className="px-6 py-4 text-right">P / L</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.holdings.map((h, i) => {
                    const isProfitable = h.profit >= 0;
                    const isSellingThis = activeSell === h.symbol;

                    return (
                      <tr key={i} className={`group transition-all border-l-[3px] ${isSellingThis ? 'bg-white/[0.04] border-brand-primary' : 'hover:bg-white/[0.02] border-transparent hover:border-brand-primary'}`}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 flex items-center justify-center rounded-xl font-black text-md transition-all ${isSellingThis ? 'bg-brand-primary text-white scale-105' : 'bg-white/5 text-brand-primary group-hover:bg-brand-primary group-hover:text-white'}`}>
                              {h.symbol?.[0]}
                            </div>
                            <div>
                              <div className="font-black text-mg leading-none">{h.symbol}</div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">Equity</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                            <div className="text-sm font-black">{h.quantity} <span className="text-[9px] text-slate-500 font-normal">Units</span></div>
                        </td>
                        <td className="px-6 py-3 text-right">
                            <div className="text-[10px] text-slate-400 font-bold">₹{h.avgPrice?.toLocaleString('en-IN')}</div>
                            <div className="text-sm font-black text-white">₹{h.currentPrice?.toLocaleString('en-IN')}</div>
                        </td>
                        <td className="px-6 py-3 text-right font-black">
                            ₹{h.totalValue?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className={`flex flex-col items-end`}>
                            <div className={`text-xs font-black rounded px-1.5 py-0.5 ${isProfitable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {isProfitable ? '+' : ''}₹{Math.abs(h.profit).toLocaleString('en-IN')}
                            </div>
                            <div className={`text-[9px] font-bold mt-1 ${isProfitable ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                                {((h.profit / (h.avgPrice * h.quantity)) * 100).toFixed(2)}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                            {isSellingThis ? (
                                <div className="flex items-center justify-end gap-1.5 animate-fade-in">
                                    <div className="flex items-center bg-black/20 rounded-lg border border-white/10 overflow-hidden ring-1 ring-white/5">
                                        <input 
                                            type="number" 
                                            value={sellQty}
                                            onChange={e => setSellQty(e.target.value)}
                                            placeholder="Quantity"
                                            className="bg-transparent w-20 px-2 py-1 text-[10px] font-black outline-none border-none text-white placeholder:text-slate-600"
                                            autoFocus
                                        />
                                        <button 
                                            onClick={() => setSellQty(h.quantity.toString())}
                                            className="px-2 py-1 text-[7px] font-black uppercase bg-white/5 hover:bg-white/10 transition-colors border-l border-white/10 text-slate-400 hover:text-white"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            disabled={processingSell}
                                            onClick={() => handleQuickSell(h.symbol, h.currentPrice)}
                                            className="bg-brand-primary p-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all text-white disabled:opacity-50"
                                            title="Confirm Sell"
                                        >
                                            {processingSell ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        </button>
                                        <button 
                                            onClick={() => { setActiveSell(null); setSellQty(""); }}
                                            className="bg-white/5 p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-all text-slate-500"
                                            title="Cancel"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setActiveSell(h.symbol)}
                                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-brand-primary text-slate-500 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-brand-primary/20"
                                >
                                    <Zap size={11} className="group-hover:fill-current" />
                                    <span>Quick Sell</span>
                                </button>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}