import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  Zap,
  LogOut,
  Plus,
  ChevronRight,
  Database,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Lock,
  RefreshCcw,
  Trash2
} from 'lucide-react';
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Transaction, Budget, SavingsGoal } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { calculateDiscipline } from '../lib/discipline';
import { storageService } from '../services/storageService';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  onAddTransaction: (t: Transaction) => void;
}

const TIPS = [
  "LA CLAVE DEL ÉXITO ES LA CONSTANCIA. MANTÉN TU CASH_FLOW POSITIVO.",
  "DIVERSIFICA TUS LOGS PARA UNA MEJOR AUDITORÍA PATRIMONIAL.",
  "LOS LÍMITES SON TUS MEJORES ALIADOS EN LA MISIÓN DE CONTROL.",
  "AHORRAR ES EL PRIMER PASO PARA CONVERTIRTE EN UNA LEYENDA FINANCIERA."
];

export const Dashboard = ({ transactions, budgets, goals, onAddTransaction }: DashboardProps) => {
  const { profile, logout } = useAuth();
  const { t } = useTranslation();
  const [currentTip, setCurrentTip] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const currentCurrency = profile?.preferredCurrency || 'USD';
  const discipline = calculateDiscipline(transactions, budgets, goals);

  const [quickAmount, setQuickAmount] = React.useState('');
  const [quickNote, setQuickNote] = React.useState('');
  const [quickCategory, setQuickCategory] = React.useState('Otros');
  const [rechargeAmount, setRechargeAmount] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleQuickAdd = async (category: string, amount: number, type: 'income' | 'expense' = 'expense') => {
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un monto válido mayor a 0');
      return;
    }
    setIsUpdating(true);
    const newTransaction: Partial<Transaction> = {
      amount,
      category,
      currency: profile?.preferredCurrency || 'USD',
      date: new Date().toISOString(),
      type,
      note: type === 'expense' ? (quickNote || 'Gasto diario rápido') : 'Recarga manual',
      userId: profile?.userId || 'local'
    };
    
    onAddTransaction(newTransaction as Transaction);
    
    setTimeout(() => {
      setQuickAmount('');
      setQuickNote('');
      setRechargeAmount('');
      setIsUpdating(false);
    }, 500);
  };

  // Stats calculation
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const essentialCategories = ['Vivienda', 'Comida', 'Salud', 'Transporte'];
  const discretionaryCategories = ['Shopping', 'Entretenimiento', 'Otros'];

  const essentialExpenses = transactions
    .filter(t => t.type === 'expense' && essentialCategories.includes(t.category))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const discretionaryExpenses = transactions
    .filter(t => t.type === 'expense' && discretionaryCategories.includes(t.category))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const essentialScore = totalIncome > 0 ? Math.max(0, 100 - ((essentialExpenses / totalIncome) * 100)) : 0;
  const badHabitsScore = totalIncome > 0 ? Math.max(0, 100 - ((discretionaryExpenses / totalIncome) * 100)) : 0;
  const savingScore = goals.length > 0 ? Math.min((goals.reduce((a, b) => a + (Math.min(b.currentAmount / b.targetAmount, 1)), 0) / goals.length) * 100, 100) : 0;
  const budgetScore = budgets.length > 0 ? Math.min((budgets.length / 5) * 100, 100) : 0;

  const statsData = [
    { subject: 'Disciplina Global', A: discipline.score, fullMark: 100 },
    { subject: 'Control Gastos Malos', A: badHabitsScore, fullMark: 100 },
    { subject: 'Gestión Necesidades', A: essentialScore, fullMark: 100 },
    { subject: 'Nivel Ahorro', A: savingScore, fullMark: 100 },
    { subject: 'Control Presupuestal', A: budgetScore, fullMark: 100 },
  ];

  const getNextRankInfo = (score: number) => {
    if (score >= 110) return { nextRef: 'MÁXIMO', points: 0, progress: 100 };
    if (score >= 95) return { nextRef: 'S+', points: 110 - score, progress: ((score - 95) / (110 - 95)) * 100 };
    if (score >= 85) return { nextRef: 'S', points: 95 - score, progress: ((score - 85) / (95 - 85)) * 100 };
    if (score >= 75) return { nextRef: 'A', points: 85 - score, progress: ((score - 75) / (85 - 75)) * 100 };
    if (score >= 60) return { nextRef: 'B', points: 75 - score, progress: ((score - 60) / (75 - 60)) * 100 };
    if (score >= 40) return { nextRef: 'C', points: 60 - score, progress: ((score - 40) / (60 - 40)) * 100 };
    return { nextRef: 'D', points: 40 - score, progress: (Math.max(score, 0) / 40) * 100 };
  };

  const nextRankInfo = getNextRankInfo(discipline.score);

  const balance = totalIncome - totalExpenses;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const budgetPerformance = budgets.map(budget => {
    const spent = monthlyTransactions
      .filter(t => t.category === budget.category && t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const percent = (spent / budget.amount) * 100;
    
    let suggestion = "Mantener vigilancia.";
    if (percent > 100) {
      if (budget.category === 'Alimentación') suggestion = "Priorizar consumo en casa.";
      else if (budget.category === 'Entretenimiento') suggestion = "Suspender gastos de ocio.";
      else suggestion = "Recortar gasto inmediato.";
    } else if (percent > 80) {
      suggestion = "Restringir uso a lo esencial.";
    }

    return {
      ...budget,
      spent,
      percent,
      isOver: spent > budget.amount,
      suggestion
    };
  });

  const overBudgets = budgetPerformance.filter(bp => bp.isOver);
  const cautionBudgets = budgetPerformance.filter(bp => bp.percent >= 80 && !bp.isOver);

  const aiInsights = [];
  
  if (totalIncome > 0 && (discretionaryExpenses / totalIncome) > 0.25) {
     aiInsights.push({
        type: 'leak',
        title: 'fuga_de_capital',
        message: `Tus 'gastos hormiga' o no esenciales superan el 25% de tus ingresos. Recórtalos para subir de rango.`,
        icon: <TrendingDown className="w-5 h-5" />,
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-100',
        textColor: 'text-rose-600',
        iconBg: 'bg-rose-500'
     });
  } else if (totalIncome > 0 && (essentialExpenses / totalIncome) > 0.8) {
     aiInsights.push({
        type: 'stress',
        title: 'estrés_financiero',
        message: `Tus obligaciones fijas asfixian tus ingresos. Analiza posibles recortes u optimizaciones.`,
        icon: <ShieldAlert className="w-5 h-5" />,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-100',
        textColor: 'text-amber-600',
        iconBg: 'bg-amber-500'
     });
  } else if (totalIncome > 0 && badHabitsScore > 85) {
     aiInsights.push({
        type: 'success',
        title: 'patrones_óptimos',
        message: `Excelente control sobre los gastos impulsivos. Continúa con esta gestión.`,
        icon: <TrendingUp className="w-5 h-5" />,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-100',
        textColor: 'text-emerald-600',
        iconBg: 'bg-emerald-500'
     });
  }

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expensesByCategory).map(cat => ({
    name: cat,
    value: expensesByCategory[cat]
  }));

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-12">
      {/* 3D Global Score Header */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="clay-card bg-white border-2 neon-border-cyan relative overflow-hidden group min-h-[220px] flex flex-col justify-center"
      >
        <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-neon-pink/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
          <div className="flex items-center gap-6">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className={cn(
                "w-24 h-24 bg-white border-4 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden",
                discipline.rank === 'S+' ? "border-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.6)]" : "border-slate-50"
              )}
            >
              <div className={cn(
                "absolute inset-0 animate-pulse", 
                discipline.rank === 'S+' ? "bg-amber-400/20" : discipline.rank === 'S' ? "bg-neon-lime/20" : "bg-neon-cyan/10"
              )} />
              <span className={cn(
                "text-5xl font-black tracking-tighter relative z-10",
                discipline.rank === 'S+' ? "text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" :
                discipline.rank === 'S' ? "text-neon-lime drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]" :
                "text-slate-800 neon-text-cyan"
              )}>{discipline.rank}</span>
            </motion.div>
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1 opacity-80">Rango Disciplinario</p>
              <h2 className="text-3xl font-black text-slate-800 mb-2 leading-none uppercase tracking-tighter">{t('level')}: <span className="text-neon-pink neon-text-pink">{discipline.rank}</span></h2>
              <p className="text-slate-500 text-sm font-bold opacity-90 max-w-sm uppercase tracking-tighter leading-tight italic">"{discipline.message}"</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
             <div className="bg-slate-50 rounded-3xl p-5 px-8 border-2 border-slate-100 shadow-inner text-center sm:text-left min-w-[140px]">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Financial Score</p>
               <div className="text-3xl font-black text-slate-800 neon-text-cyan">{Math.round(discipline.score)}%</div>
             </div>

             <div className="w-full sm:w-auto flex-1 max-w-[200px]">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Próximo Rango: {nextRankInfo.nextRef}</span>
                 {nextRankInfo.points > 0 && <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">faltan {Math.ceil(nextRankInfo.points)} pts</span>}
               </div>
               <div className="h-2.5 w-full bg-slate-100/50 rounded-full overflow-hidden border border-slate-200">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${nextRankInfo.progress}%` }}
                   transition={{ duration: 1, ease: 'easeOut' }}
                   className={cn(
                     "h-full rounded-full",
                     discipline.rank === 'S+' ? "bg-amber-400" :
                     discipline.rank === 'S' ? "bg-neon-lime" :
                     "bg-neon-cyan"
                   )}
                 />
               </div>
             </div>

             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleLogout}
               className="bg-rose-50 rounded-3xl p-5 px-6 border-2 border-rose-100 shadow-inner flex flex-col items-center justify-center text-rose-500 hover:bg-rose-100 transition-all group shrink-0"
             >
               <LogOut className="w-6 h-6 mb-1 group-hover:-translate-x-1 transition-transform" />
               <span className="text-[9px] font-black uppercase tracking-widest leading-none">{t('logout')}</span>
             </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Smart Alerts & Insights */}
      {(overBudgets.length > 0 || cautionBudgets.length > 0 || aiInsights.length > 0) && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-3"
        >
          {aiInsights.map((insight, i) => (
            <div key={`insight-${i}`} className={cn(insight.bgColor, insight.borderColor, "border-2 p-4 rounded-2xl flex items-center gap-4 bg-opacity-70")}>
               <div className={cn(insight.iconBg, "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0")}>
                  {insight.icon}
               </div>
               <div>
                  <h5 className={cn(insight.textColor, "text-[10px] font-black uppercase tracking-widest leading-none mb-1")}>AI_ANALYSIS: {insight.title}</h5>
                  <p className="text-[11px] font-bold text-slate-700 leading-tight">{insight.message}</p>
               </div>
               <div className="ml-auto flex flex-col items-end">
                  <span className={cn(insight.textColor, "text-[10px] font-black italic")}>SYSTEM_LOG</span>
               </div>
            </div>
          ))}

          {overBudgets.map((b, i) => (
            <div key={`over-${i}`} className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
               <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0">
                  <ShieldAlert className="w-6 h-6" />
               </div>
               <div>
                  <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">ALERTA_PRESUPUESTO: {b.category}</h5>
                  <p className="text-[11px] font-bold text-slate-700 leading-tight">HAS SUPERADO EL LÍMITE DE {formatCurrency(b.amount, currentCurrency)} POR {formatCurrency(b.spent - b.amount, currentCurrency)}.</p>
               </div>
               <div className="ml-auto flex flex-col items-end">
                  <span className="text-[10px] font-black text-rose-500 italic">CRITICAL_FAIL</span>
                  <span className="text-[9px] font-bold text-rose-400">Sug: {b.suggestion}</span>
               </div>
            </div>
          ))}
          {cautionBudgets.map((b, i) => (
            <div key={i} className="bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl flex items-center gap-4">
               <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Lock className="w-6 h-6" />
               </div>
               <div>
                  <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">AVISO_DE_CONTROL: {b.category}</h5>
                  <p className="text-[11px] font-bold text-slate-700 leading-tight">ESTÁS AL {b.percent.toFixed(0)}% DE TU LÍMITE MENSUAL.</p>
               </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Main Stats Grid with Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="lg:col-span-4 clay-card border-none bg-slate-950 text-white p-8 relative overflow-hidden group min-h-[220px] flex flex-col justify-center border-b-4 border-neon-cyan shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform duration-700">
            <TrendingUp className="w-24 h-24 text-neon-cyan/40" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-neon-cyan group-hover:animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">INTEGRIDAD_CARTERA</p>
            </div>
            <motion.div 
              key={balance}
              initial={{ scale: 1.2, color: '#00ffff' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-5xl font-black tracking-tighter mb-4 tabular-nums italic"
            >
              {formatCurrency(balance, currentCurrency)}
            </motion.div>
            <div className="flex items-center gap-3">
              <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2", 
                balance >= 0 ? "bg-neon-lime/10 text-neon-lime border border-neon-lime/20" : "bg-neon-pink/10 text-neon-pink border border-neon-pink/20")}>
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", balance >= 0 ? "bg-neon-lime" : "bg-neon-pink")} />
                {balance >= 0 ? 'Status: Nominal' : 'Status: Critical'}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Auditoría en tiempo real</span>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-8 clay-card p-6 bg-slate-50/50 border-2 border-slate-100 flex flex-col relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
             <Zap className="w-40 h-40 text-indigo-500" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] mb-1">MisiÓn Daria: Registrar Gasto</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Registra tu flujo diario en un toque para actualizar el score.</p>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{profile?.displayName || 'PLAYER_01'}</span>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
               </div>
            </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                {[
                  { cat: 'Comida', icon: '🍔' },
                  { cat: 'Vivienda', icon: '🏠' },
                  { cat: 'Transporte', icon: '🚗' },
                  { cat: 'Shopping', icon: '🛍️' },
                  { cat: 'Entretenimiento', icon: '🎮' },
                  { cat: 'Salud', icon: '🏥' },
                  { cat: 'Salario', icon: '💰' },
                  { cat: 'Inversiones', icon: '📈' },
                  { cat: 'Otros', icon: '➕' }
                ].map((btn, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isUpdating}
                    onClick={() => {
                      setQuickCategory(btn.cat);
                      setQuickAmount('');
                      setQuickNote(`${btn.cat}: `);
                      document.getElementById('quick-amount-input')?.focus();
                    }}
                    className={cn(
                      "p-3 bg-white border-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all flex flex-col items-center gap-1.5 relative overflow-hidden",
                      quickCategory === btn.cat 
                        ? "border-neon-pink text-neon-pink shadow-[0_0_15px_rgba(255,105,180,0.3)]" 
                        : "border-slate-200 text-slate-600 hover:border-neon-pink hover:text-neon-pink group/btn"
                    )}
                  >
                    {(quickCategory !== btn.cat) && <div className="absolute inset-x-0 bottom-0 h-1 bg-neon-pink translate-y-full group-hover/btn:translate-y-0 transition-transform" />}
                    <span className="text-xl mb-0.5">{btn.icon}</span>
                    <span className={cn("transition-colors", quickCategory === btn.cat ? "text-neon-pink" : "text-slate-600 group-hover:text-neon-pink")}>{btn.cat}</span>
                  </motion.button>
                ))}
              </div>

            <div className="mt-auto flex flex-col gap-6">
              <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white">
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest whitespace-nowrap flex items-center gap-2">
                   <TrendingUp className="w-3 h-3" /> CARGAR_SALDO:
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-300 italic">$</span>
                  <input 
                    type="number"
                    placeholder="Recargar wallet..."
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    className="w-full pl-6 pr-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-xl text-xs font-black focus:border-emerald-400 focus:outline-none transition-all placeholder:text-emerald-200"
                  />
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  disabled={!rechargeAmount || isUpdating}
                  onClick={() => handleQuickAdd('Otros', parseFloat(rechargeAmount), 'income')}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-emerald-100"
                >
                  {isUpdating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <>RECARGAR <Plus className="w-3 h-3" /></>}
                </motion.button>
              </div>

              <div className="flex flex-col gap-4 bg-slate-900 shadow-2xl p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-2">
                     <TrendingDown className="w-3 h-3 text-neon-pink" /> TRANSACCIÓN RÁPIDA:
                  </div>
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter italic">Protocolo Anti-Fuga Activo</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-600 italic">$</span>
                    <input 
                      id="quick-amount-input"
                      type="number"
                      placeholder="Monto"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(e.target.value)}
                      className="w-full pl-6 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-xs font-black text-white focus:border-neon-pink focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <div className="sm:col-span-4 relative">
                    <input 
                      type="text"
                      placeholder="Motivo / Descripción"
                      value={quickNote}
                      onChange={(e) => setQuickNote(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-xs font-black text-white focus:border-neon-pink focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      disabled={!quickAmount || isUpdating}
                      onClick={() => handleQuickAdd(quickCategory, parseFloat(quickAmount), ['Salario', 'Inversiones'].includes(quickCategory) ? 'income' : 'expense')}
                      className="w-full h-full py-3 bg-neon-pink text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-400 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-neon-pink/20"
                    >
                      {isUpdating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <>REGISTRAR <Plus className="w-3 h-3" /></>}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Monthly Audit Insight & 50/30/20 Rule */}
          <div className="clay-card border-none bg-indigo-900 p-6 text-white relative overflow-hidden flex flex-col justify-between">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Database className="w-16 h-16" />
             </div>
             
             <div className="relative z-10 mb-4">
                <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4">MÉTRICA_MENSUAL: [REGLA 50/30/20]</h4>
                <div className="flex items-end gap-2 mb-2">
                   <span className="text-3xl font-black tracking-tighter italic">{formatCurrency(balance, currentCurrency)}</span>
                   <span className="text-[10px] font-bold text-indigo-300 mb-1">BALANCE_NETO</span>
                </div>
                <p className="text-[9px] font-medium text-indigo-200 leading-relaxed uppercase tracking-tighter italic mb-4">
                   Compara tus gastos reales contra el framework ideal de finanzas.
                </p>
             </div>

             <div className="relative z-10 space-y-4">
                <div className="space-y-1">
                   <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-widest">
                     <span className="text-emerald-300">Necesidades (~50%)</span>
                     <span className={cn(totalIncome > 0 && essentialExpenses / totalIncome > 0.5 ? "text-rose-400" : "text-emerald-400")}>
                        {totalIncome > 0 ? Math.round((essentialExpenses / totalIncome) * 100) : 0}%
                     </span>
                   </div>
                   <div className="h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${totalIncome > 0 ? Math.min((essentialExpenses / totalIncome) * 100, 100) : 0}%` }}
                       className={cn("h-full rounded-full", totalIncome > 0 && essentialExpenses / totalIncome > 0.5 ? "bg-rose-500" : "bg-emerald-500")}
                     />
                   </div>
                </div>

                <div className="space-y-1">
                   <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-widest">
                     <span className="text-amber-300">Deseos (~30%)</span>
                     <span className={cn(totalIncome > 0 && discretionaryExpenses / totalIncome > 0.3 ? "text-rose-400" : "text-amber-400")}>
                        {totalIncome > 0 ? Math.round((discretionaryExpenses / totalIncome) * 100) : 0}%
                     </span>
                   </div>
                   <div className="h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${totalIncome > 0 ? Math.min((discretionaryExpenses / totalIncome) * 100, 100) : 0}%` }}
                       className={cn("h-full rounded-full", totalIncome > 0 && discretionaryExpenses / totalIncome > 0.3 ? "bg-rose-500" : "bg-amber-500")}
                     />
                   </div>
                </div>

                <div className="space-y-1">
                   <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-widest">
                     <span className="text-neon-cyan">Ahorro/Libre (~20%)</span>
                     <span className={cn(totalIncome > 0 && balance / totalIncome < 0.2 ? "text-rose-400" : "text-neon-cyan")}>
                        {totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%
                     </span>
                   </div>
                   <div className="h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${totalIncome > 0 ? Math.max(0, Math.min((balance / totalIncome) * 100, 100)) : 0}%` }}
                       className={cn("h-full rounded-full", totalIncome > 0 && balance / totalIncome < 0.2 ? "bg-rose-500" : "bg-neon-cyan")}
                     />
                   </div>
                </div>
             </div>
          </div>

          {/* Daily Quest */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="clay-card border-none bg-slate-900 p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
              <Award className="w-20 h-20 text-neon-yellow" />
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-neon-yellow uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" />
                {t('daily_quest')}
              </h4>
              <p className="text-white font-black text-lg leading-tight mb-2 tracking-tight uppercase">{t('quest_desc')}</p>
              <div className="flex items-center gap-3">
                 <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '66%' }}
                      className="h-full bg-neon-yellow shadow-[0_0_10px_rgba(255,255,0,0.5)]"
                    />
                 </div>
                 <span className="text-[10px] font-black text-neon-yellow">2/3</span>
              </div>
            </div>
          </motion.div>

          {/* Management Rating Stats */}
          <div className="clay-card border-none bg-slate-900 p-6 overflow-hidden flex flex-col gap-4">
             <div>
                <h4 className="text-[10px] font-black text-neon-cyan uppercase tracking-widest mb-1">Calificación de Gestión</h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Análisis de tu administración financiera</p>
             </div>
             <div className="space-y-4 mt-2">
               {statsData.map((stat, i) => (
                 <div key={i} className="space-y-1.5">
                   <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.subject}</span>
                     <span className="text-[10px] font-black" style={{ color: stat.A >= 80 ? '#00ff00' : stat.A >= 60 ? '#00ffff' : stat.A >= 40 ? '#ffff00' : '#ff00ff' }}>{Math.round(stat.A)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${stat.A}%` }}
                       className="h-full rounded-full"
                       style={{ 
                         backgroundColor: stat.A >= 80 ? '#39ff14' : stat.A >= 60 ? '#00ffff' : stat.A >= 40 ? '#ffff00' : '#ff1493',
                         boxShadow: `0 0 8px ${stat.A >= 80 ? '#39ff14' : stat.A >= 60 ? '#00ffff' : stat.A >= 40 ? '#ffff00' : '#ff1493'}`
                       }}
                     />
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="clay-card flex-1 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 blur-3xl group-hover:bg-neon-cyan/10 transition-all rounded-full" />
            
            <div className="relative z-10">
              <h4 className="text-lg font-black text-slate-800 mb-1 tracking-tighter uppercase">Composición</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribución de Gastos</p>
            </div>
            
            <div className="h-64 mt-6 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={5}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="rounded-full outline-none transition-all duration-500 hover:opacity-80" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '24px', 
                      border: '2px solid #f1f5f9', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      fontWeight: '900',
                      textTransform: 'uppercase'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <Database className="w-6 h-6 text-slate-100 mb-1" />
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Vault Ops</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6 relative z-10">
              {pieData.slice(0, 4).map((d, i) => (
                <div key={i} className="flex items-center gap-2 p-2 px-3 bg-slate-50 rounded-xl border border-slate-100/50 shadow-inner">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: COLORS[i], color: COLORS[i] }} />
                  <span className="text-[9px] font-black text-slate-500 truncate uppercase tracking-tighter">{t(d.name as any)}</span>
                </div>
              ))}
            </div>
          </div>


        </div>

        <div className="lg:col-span-8 flex flex-col">
          <div className="clay-card h-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-lg font-extrabold text-slate-800">Actividad Reciente</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Últimos movimientos registrados</p>
              </div>
              <button className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin actividad detectada</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((tx, i) => (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={tx.id || i} 
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                  >
                    <div className="flex items-center space-x-4 transition-transform group-hover:translate-x-1">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner",
                        tx.type === 'income' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                      )}>
                        {tx.category.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-0.5">{t(tx.category as any)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-base font-black tracking-tight",
                      tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currentCurrency)}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Activity Log Overlay */}
      <div className="clay-card border-none bg-slate-950 p-6 font-mono text-[9px] uppercase tracking-widest text-slate-500 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
            <span className="text-slate-600">HISTORIAL_ACTIVO</span>
            <RefreshCcw className="w-3 h-3 text-slate-700 opacity-40" />
         </div>
         <div className="flex flex-col gap-2 min-h-[80px]">
            {transactions.length === 0 ? (
               <div className="flex gap-4 opacity-40">
                  <span className="text-slate-700">[VOID]</span>
                  <span>Esperando actividad financiera...</span>
               </div>
            ) : (
              transactions.slice(0, 4).map((tx, i) => (
                <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                   <span className={cn(tx.type === 'income' ? "text-emerald-500" : "text-rose-500")}>
                      [{tx.type === 'income' ? 'INGRESO' : 'GASTO'}]
                   </span>
                   <span className="text-slate-500">
                      {new Date(tx.date).toLocaleTimeString([], { hour12: false })}: {tx.category} {tx.note ? `(${tx.note})` : ''} 
                   </span>
                   <span className={cn("ml-auto mr-4", tx.type === 'income' ? "text-emerald-500" : "text-rose-500")}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount}
                   </span>
                   <button 
                     onClick={async () => {
                        if(tx.id) {
                           await storageService.deleteTransaction(tx.id);
                        }
                     }}
                     className="p-1 hover:bg-rose-500/10 rounded text-slate-700 hover:text-rose-500 transition-colors"
                     title="Eliminar log"
                   >
                     <Trash2 className="w-3 h-3" />
                   </button>
                </div>
              ))
            )}
            <div className="flex gap-4 border-t border-slate-900 pt-2 mt-2 opacity-60">
               <span className="text-slate-700">[OPERATIVO]</span>
               <span>Gestión de flujo en tiempo real activa.</span>
            </div>
         </div>
      </div>

      {/* Arcade Tip Ticker */}
      <div className="bg-indigo-600 p-3 rounded-2xl border-t-2 border-indigo-400 overflow-hidden relative">
         <motion.div 
           key={currentTip}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="flex items-center gap-3 text-white"
         >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
               <Zap className="w-3 h-3 text-neon-yellow fill-current" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] truncate">
              TIP_DEL_DÍA: <span className="opacity-80 italic">{TIPS[currentTip]}</span>
            </p>
         </motion.div>
         <div className="absolute bottom-0 left-0 h-0.5 bg-neon-cyan/50 w-full origin-left animate-[loading-bar_8s_linear_infinite]" />
      </div>
    </div>
  );
};
