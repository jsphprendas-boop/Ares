import React from 'react';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  Wallet, 
  Target, 
  Calendar,
  LogOut,
  TrendingUp,
  Languages,
  ShieldCheck,
  Download,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useState, useEffect } from 'react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
}

import { Transaction } from '../types';
import { calculateDiscipline } from '../lib/discipline';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  transactions: Transaction[];
}

export const Sidebar = ({ activeTab, setActiveTab, transactions }: SidebarProps) => {
  const { profile, logout } = useAuth();
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    const promptInstall = () => {
       handleInstall();
    };
    window.addEventListener('prompt-install', promptInstall);
    
    return () => {
       window.removeEventListener('beforeinstallprompt', handler);
       window.removeEventListener('prompt-install', promptInstall);
    }
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert('Para instalar en iOS: Pulsa el botón "Compartir" y selecciona "Añadir a pantalla de inicio".\n\nTo install on iOS: Tap "Share" and select "Add to Home Screen".');
    }
  };
  
  // Calculate Level and Progress
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const level = Math.floor(totalIncome / 500) + 1;
  const progressToNextLevel = ((totalIncome % 500) / 500) * 100;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('overview') },
    { id: 'calendar', icon: Calendar, label: t('agenda') },
    { id: 'transactions', icon: ArrowUpCircle, label: t('history') },
    { id: 'budgets', icon: Wallet, label: t('budgets') },
    { id: 'goals', icon: Target, label: t('missions') },
  ];

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 flex items-center justify-around bg-white/80 backdrop-blur-xl border-2 border-slate-100 p-2 rounded-[2.5rem] shadow-2xl shadow-indigo-100">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all relative",
              activeTab === item.id ? "text-indigo-600 bg-slate-50" : "text-slate-400"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeTab === item.id && "neon-text-cyan")} />
            {activeTab === item.id && (
              <motion.div layoutId="nav-glow-mobile" className="absolute -bottom-1 w-1 h-1 bg-neon-cyan rounded-full shadow-[0_0_8px_rgba(0,255,255,1)]" />
            )}
          </button>
        ))}
      </nav>

      <aside className="w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 hidden md:flex flex-col z-50 transition-all duration-500">
      <div className="p-8 flex flex-col items-center">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-14 h-14 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-4 neon-border-cyan border-2"
        >
          <TrendingUp className="w-7 h-7" />
        </motion.div>
        <span className="text-xl font-extrabold tracking-tight text-slate-800">ARCADE <span className="text-neon-pink neon-text-pink font-black">PRO</span></span>
        <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest text-center">El Avance de tus Finanzas</span>
      </div>

      <nav className="flex-1 px-4 space-y-3 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-black transition-all group relative border-2 border-transparent",
              activeTab === item.id 
                ? "bg-slate-50 text-indigo-600 border-indigo-100 shadow-sm" 
                : "text-slate-400 hover:bg-slate-50 hover:text-indigo-400"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-indigo-600 neon-text-cyan" : "text-slate-400 group-hover:text-indigo-400")} />
            <span className="text-sm uppercase tracking-tight">{item.label}</span>
            {activeTab === item.id && (
              <motion.div layoutId="nav-indicator" className="absolute left-[-4px] w-2 h-10 bg-neon-cyan rounded-r-full shadow-[0_0_10px_rgba(0,255,255,1)]" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto space-y-4">
        {/* Install App Button */}
        <button 
          onClick={handleInstall}
          className="clay-card border-none bg-indigo-600 text-white p-4 flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all w-full text-left shadow-lg shadow-indigo-200"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black leading-none mb-1">{t('install_app')}</p>
            <p className="text-[8px] font-bold opacity-80 leading-tight uppercase tracking-tighter">{t('download_desc')}</p>
          </div>
        </button>

        {/* Level Progress Bar */}
        <div className="clay-card border-none bg-slate-50 p-4 space-y-2 mb-2">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span>{t('level')} {level}</span>
            <span>XP: {totalIncome % 500} / 500</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner p-[1px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              className="h-full bg-neon-cyan rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)]"
            />
          </div>
        </div>

        <button 
          onClick={() => logout()}
          className="flex items-center justify-center gap-2 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl w-full transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-rose-100 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export const Header = ({ title, onShowTutorial }: { title: string, onShowTutorial?: () => void }) => {
  const { profile, updateProfile, logout } = useAuth();
  const { lang, t } = useTranslation();
  const currencies = ['USD', 'CRC', 'EUR', 'MXN', 'COP'];

  const toggleLanguage = () => {
    updateProfile({ language: lang === 'es' ? 'en' : 'es' });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateProfile({ preferredCurrency: e.target.value });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30 border-b border-white/40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-neon-cyan/10 rounded-xl flex items-center justify-center border border-neon-cyan/20">
          <ShieldCheck className="w-6 h-6 text-neon-cyan animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.3)]" />
        </div>
        <h1 className="text-lg font-extrabold text-slate-800 tracking-tight uppercase hidden sm:block">{title}</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button 
          onClick={() => {
            const ev = new Event('prompt-install');
            window.dispatchEvent(ev);
          }}
          className="md:hidden flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-500 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest"
          title="Install App"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Instalar</span>
        </button>

        <div className="relative group/curr">
          <select 
            value={profile?.preferredCurrency || 'USD'}
            onChange={handleCurrencyChange}
            className="appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black text-slate-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all uppercase tracking-widest pr-8"
          >
            {currencies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        <button 
          onClick={onShowTutorial}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 transition-all shadow-sm"
          title="Tutorial / Ayuda"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="sr-only">Tutorial</span>
        </button>

        <button 
          onClick={toggleLanguage}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-neon-cyan transition-all"
        >
          <Languages className="w-5 h-5" />
          <span className="sr-only">Switch Language</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-all font-black text-[10px] uppercase tracking-widest group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">{t('logout')}</span>
        </button>

        <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block" />

        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Perfil Activo</p>
          <p className="text-sm font-extrabold text-slate-700">{profile?.displayName}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shadow-sm shadow-indigo-100 ring-4 ring-white">
          {profile?.displayName?.charAt(0) || 'P'}
        </div>
      </div>
    </header>
  );
};
