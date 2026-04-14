import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "../firebaseClient";
import { useState, useEffect, useRef } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Search, X
} from "lucide-react";

export default function Trade() {
  const [promotedSymbols, setPromotedSymbols] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [marketData, setMarketData] = useState({ price: 0, history: [] });
  const [quantity, setQuantity] = useState(1);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const [message, setMessage] = useState(null);
  const [mounted, setMounted] = useState(false);

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    const fetchPromoted = async () => {
        const res = await fetch("/api/market/list");
        const data = await res.json();
        if (res.ok) setPromotedSymbols(data.symbols);
    };

    const fetchBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // Silent return for guests

      const res = await fetch("/api/user/portfolio", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setBalance(data.balance);
    };

    fetchBalance();
    fetchPromoted();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/market/search?q=${searchQuery}`);
        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.results.slice(0, 10));
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  useEffect(() => {
    let interval;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/market/price?symbol=${selectedSymbol}`);
        const data = await res.json();
        if (res.ok) {
          setMarketData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch market data", err);
      }
    };

    fetchData();
    interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const loginWithGoogle = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
  
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
  
      await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
  
      localStorage.setItem("token", token);
      window.location.href = "/trade";
  
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrade = async (type) => {
    setTrading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/trade/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ symbol: selectedSymbol, quantity: Number(quantity) }),
      });
      const result = await res.json();
      if (res.ok) {
          setMessage({ type: "success", text: `${type.toUpperCase()} successful!` });
          const price = marketData.price;
          setBalance(prev => type === 'buy' ? prev - (price * quantity) : prev + (price * quantity));
      } else {
          setMessage({ type: "error", text: result.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Transaction failed" });
    } finally {
      setTrading(false);
    }
  };

  const isPositive = marketData.history.length > 1 && 
    marketData.price >= marketData.history[0].price;

  const displaySymbols = searchQuery.trim().length >= 2 ? searchResults : promotedSymbols;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <aside className="lg:col-span-1 space-y-4">
            <div className="glass p-4 rounded-2xl flex items-center gap-2 border-white/5 relative group transition-all focus-within:border-brand-primary/50">
              <Search size={18} className={`${isSearching ? 'animate-pulse text-brand-primary' : 'text-slate-500'}`} />
              <input 
                className="bg-transparent border-none outline-none text-sm w-full" 
                placeholder="Search globally (symbol or name)..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white transition-colors">
                    <X size={16} />
                </button>
              )}
            </div>
            
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="text-slate-500 text-[10px] uppercase font-black px-4 mb-2">
                {searchQuery.trim().length >= 2 ? 'Search Results' : 'Promoted Markets'}
              </div>
              
              {displaySymbols.length === 0 && !isSearching && searchQuery.trim().length >= 2 && (
                <div className="text-center py-8 text-slate-500 text-sm italic">
                    No results found for "{searchQuery}"
                </div>
              )}

              {displaySymbols.map(s => (
                <button 
                  key={s.symbol}
                  onClick={() => { setSelectedSymbol(s.symbol); setLoading(true); }}
                  className={`w-full flex justify-between items-center p-4 rounded-2xl transition-all ${
                    selectedSymbol === s.symbol ? 'glass border-brand-primary/50 shadow-lg shadow-brand-primary/10' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden text-left">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center font-bold text-brand-primary">
                      {s.symbol[0]}
                    </div>
                    <div className="truncate">
                        <div className="font-bold truncate">{s.symbol}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase truncate">{s.name}</div>
                    </div>
                  </div>
                  {selectedSymbol === s.symbol && <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>}
                </button>
              ))}
            </div>
          </aside>

          <main className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-[2rem] min-h-[500px] flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-4xl font-black">{selectedSymbol}</h2>
                    <span className="text-slate-500 bg-white/5 px-2 py-0.5 rounded text-xs font-mono lowercase">live</span>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="text-2xl">₹{marketData.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full" style={{ minHeight: '350px' }}>
                {!mounted || loading ? (
                  <div className="h-[350px] w-full flex items-center justify-center animate-pulse text-slate-600 font-medium tracking-widest text-[10px] uppercase">
                    {loading ? "Establishing handshake with data feed..." : "Terminal Ready."}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={marketData.history}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" hide />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        orientation="right" 
                        stroke="rgba(255,255,255,0.2)" 
                        fontSize={10} 
                        tickFormatter={(v) => `₹${v}`} 
                        axisLine={false} tickLine={false} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={isPositive ? "#10b981" : "#f43f5e"} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-6 rounded-3xl border-l-[6px] border-brand-primary">
                <div className="text-slate-400 text-[10px] uppercase font-black mb-1">Exchange Status</div>
                <div className="text-xl font-black">MARKET OPEN</div>
              </div>
              <div className="glass p-6 rounded-3xl border-l-[6px] border-brand-secondary">
                <div className="text-slate-400 text-[10px] uppercase font-black mb-1">Execution Speed</div>
                <div className="text-xl font-black text-brand-secondary">0.12ms</div>
              </div>
            </div>
          </main>

          <section className="lg:col-span-1">
            <div className="glass p-8 rounded-[2rem] sticky top-8">
              <h3 className="text-lg font-black mb-6 uppercase tracking-widest">Execute Position</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Shares / Units</label>
                  <div className="relative group">
                    <input 
                      type="number" min="1" value={quantity}
                      onChange={e => setQuantity(Math.max(1, e.target.value))}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-brand-primary transition-all text-xl font-mono"
                    />
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Grand Total</span>
                    <span className="text-brand-primary font-black text-sm">₹{(marketData.price * quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {mounted && (balance > 0 || localStorage.getItem("token")) ? (
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      disabled={trading} onClick={() => handleTrade('buy')}
                      className="bg-emerald-500 py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-white"
                    >
                      BUY {selectedSymbol}
                    </button>
                    <button 
                      disabled={trading} onClick={() => handleTrade('sell')}
                      className="glass hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      SELL {selectedSymbol}
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-4">
                    <div className="p-4 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-4">Membership Required</p>
                      <button 
                        onClick={loginWithGoogle}
                        className="block w-full bg-brand-primary py-4 rounded-xl font-black text-lg hover:scale-[1.05] transition-all shadow-xl shadow-brand-primary/20"
                      >
                        Sign In to Trade
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed px-4">
                      Join thousands of traders. Practice with ₹1,00,000 virtual capital.
                    </p>
                  </div>
                )}

                {message && (
                  <div className={`p-4 rounded-xl text-center text-sm font-bold animate-fade-in ${
                    message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}