import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, LineChart, LogOut, UserCircle } from 'lucide-react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import app from "../firebaseClient";
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("token"));
  }, [router.pathname]);

  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      localStorage.removeItem("token");
      window.location.href = "/trade";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

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

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, requiresAuth: true },
    { name: 'Trade', path: '/trade', icon: LineChart, requiresAuth: false },
  ];


  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#0f172a] border-b border-white/5 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
        <div className="flex items-center gap-6 md:gap-12">
          <Link href="/trade" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-black italic text-white group-hover:rotate-6 transition-transform shadow-lg shadow-brand-primary/20">S</div>
            <span className="text-xl font-black tracking-tighter hidden sm:block">StockSim</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              if (item.requiresAuth && !hasToken) return null;
              
              const Icon = item.icon;
              const isActive = router.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-brand-primary/10 text-brand-primary' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
            {hasToken ? (
              <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 pl-4 py-2 text-slate-500 hover:text-rose-400 transition-colors border-l border-white/10 ml-2"
                  title="Logout"
              >
                  <LogOut size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="flex items-center gap-2 px-6 py-2 bg-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
              >
                <UserCircle size={18} />
                <span>Sign In</span>
              </button>
            )}
        </div>
      </div>
    </header>
  );
}
