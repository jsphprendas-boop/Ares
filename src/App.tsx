import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './lib/AuthContext';
import { useTranslation } from './hooks/useTranslation';
import { Transaction, Budget, SavingsGoal, Profile } from './types';
import { Sidebar, Header } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { TransactionsView } from './views/Transactions';
import { BudgetsView } from './views/Budgets';
import { GoalsView } from './views/Goals';
import { CalendarView } from './views/Calendar';
import { TutorialModal } from './components/TutorialModal';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Sparkles, User, Zap } from 'lucide-react';
import { cn } from './lib/utils';
import { storageService } from './services/storageService';

const AppContents = () => {
  const { profile, loading, setLocalProfile } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Show tutorial logic: if it's their first time loading in
    if (!loading && profile) {
      const hasSeen = localStorage.getItem('arcade_has_seen_tutorial');
      if (!hasSeen) {
        setShowTutorial(true);
        localStorage.setItem('arcade_has_seen_tutorial', 'true');
      }
    }
  }, [loading, profile]);

  useEffect(() => {
    if (loading) return;

    if (profile) {
      // Pull data from storage
      setTransactions(storageService.getTransactions());
      setBudgets(storageService.getBudgets());
      setGoals(storageService.getGoals());
    }
  }, [profile, loading]);

  const handleAddTransaction = (newTransaction: Transaction) => {
    const txWithId = { ...newTransaction, id: crypto.randomUUID() };
    storageService.saveTransaction(txWithId);
    setTransactions(prev => [txWithId, ...prev]);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 border-4 border-t-neon-cyan border-r-neon-pink border-b-neon-lime border-l-neon-purple rounded-full shadow-[0_0_20px_rgba(0,255,255,0.5)]"
          />
          <p className="text-xs font-black text-slate-400 animate-pulse tracking-widest">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Animated Background Grids/Glows */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-cyan/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-pink/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
        
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="clay-card max-w-md w-full text-center space-y-10 p-12 border-none bg-slate-900/80 backdrop-blur-2xl relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col items-center">
             <motion.div 
               animate={{ 
                 rotateY: [0, 180, 360],
                 y: [0, -10, 0]
               }}
               transition={{ 
                 rotateY: { duration: 5, repeat: Infinity, ease: "linear" },
                 y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
               }}
               className="w-24 h-24 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-8 border-4 border-neon-cyan relative"
             >
                <TrendingUp className="w-12 h-12" />
                <div className="absolute -inset-2 border-2 border-neon-pink rounded-[2rem] opacity-30 animate-ping" />
             </motion.div>
             <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3 italic">
               ARCADE<span className="text-neon-pink neon-text-pink block mt-2">PRO</span>
             </h1>
             <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-neon-cyan to-transparent mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">{t('welcome_subtitle')}</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => {
                const localProfile: Profile = {
                  uid: 'local',
                  userId: 'local',
                  displayName: 'Player 1',
                  email: '',
                  preferredCurrency: 'USD',
                  language: 'es',
                  createdAt: new Date().toISOString()
                };
                setLocalProfile(localProfile);
              }}
              className="group relative overflow-hidden w-full bg-neon-cyan text-slate-950 font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.5)] transition-all hover:-translate-y-1 active:translate-y-0.5 flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Zap className="w-5 h-5 text-slate-950 fill-current" />
              <span className="tracking-widest uppercase text-sm">INICIAR MISIÓN LOCAL</span>
            </button>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 text-left">
              <p className="text-[9px] font-black text-neon-cyan uppercase tracking-widest mb-1">AUDITORIA_PRIVACIDAD:</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase leading-relaxed">
                SUS DATOS SE ALMACENARÁN EXCLUSIVAMENTE EN ESTE NAVEGADOR. NO HAY TRANSFERENCIA A LA NUBE. MÁXIMA SEGURIDAD LOCAL ACTIVA.
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="fixed bottom-8 left-0 right-0 z-10 flex justify-center gap-10">
           {[
             { label: 'NETWORK', val: 'OFFLINE', color: 'text-neon-cyan' },
             { label: 'DATABASE', val: 'LOCAL', color: 'text-neon-pink' },
             { label: 'PLAYERS', val: 'SOLO', color: 'text-neon-lime' }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">{stat.label}</span>
                <span className={cn("text-[10px] font-black uppercase tracking-widest", stat.color)}>{stat.val}</span>
             </div>
           ))}
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard transactions={transactions} budgets={budgets} goals={goals} onAddTransaction={handleAddTransaction} />;
      case 'transactions': return <TransactionsView transactions={transactions} />;
      case 'budgets': return <BudgetsView budgets={budgets} transactions={transactions} />;
      case 'goals': return <GoalsView goals={goals} />;
      case 'calendar': return <CalendarView transactions={transactions} />;
      default: return <Dashboard transactions={transactions} budgets={budgets} goals={goals} onAddTransaction={handleAddTransaction} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return t('overview');
      case 'transactions': return t('history');
      case 'budgets': return t('budgets');
      case 'goals': return t('missions');
      case 'calendar': return t('agenda');
      default: return 'Arcade Finance';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} transactions={transactions} />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header title={getTitle()} onShowTutorial={() => setShowTutorial(true)} />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContents />
    </AuthProvider>
  );
}

