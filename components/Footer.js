import { useRouter } from 'next/router';

export default function Footer() {
  const router = useRouter();
  

  return (
    <footer className="w-full py-8 mt-auto border-t border-white/5 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
        <div className="text-slate-600 text-[10px] uppercase font-black tracking-[0.2em] mb-4">
          &copy; 2026 StockSim Pro • Global Financial Gateway
        </div>
        <div className="h-1 w-20 bg-brand-primary rounded-full opacity-50"></div>
      </div>
    </footer>
  );
}
