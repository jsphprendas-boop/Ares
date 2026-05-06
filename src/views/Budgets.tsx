import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  Wallet, 
  AlertCircle,
  TrendingDown,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { CATEGORIES, CURRENCIES, Budget, Transaction, Currency } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { storageService } from '../services/storageService';

interface BudgetsViewProps {
  budgets: Budget[];
  transactions: Transaction[];
}

export const BudgetsView = ({ budgets, transactions }: BudgetsViewProps) => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingrese un monto válido mayor a 0');
      return;
    }
    
    const newBudget: Budget = {
      userId: profile.userId || 'local',
      category,
      amount: parsedAmount,
      currency: profile?.preferredCurrency || 'USD',
      period: 'monthly'
    };

    await storageService.saveBudget(newBudget);
    setShowForm(false);
    setAmount('');
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Deseas eliminar este presupuesto?')) {
      await storageService.deleteBudget(id);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{t('budgets')}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Límites preventivos por sector</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="clay-button bg-white text-rose-600 border-2 neon-border-pink hover:bg-slate-50 shadow-rose-100"
        >
          <Plus className="w-5 h-5" />
          CONFIGURAR LÍMITE
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="clay-card w-full max-w-md relative bg-white border-2 border-slate-100 shadow-2xl"
            >
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-neon-pink transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">FIJAR LÍMITE</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Define el máximo mensual para un sector</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector / Categoría</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="clay-input">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('amount')}</label>
                  <div className="flex gap-4">
                    <input required type="number" placeholder="000.00" value={amount} onChange={e => setAmount(e.target.value)} className="clay-input flex-1" />
                  </div>
                </div>

                <div className="p-4 bg-neon-yellow/10 rounded-2xl flex gap-3 border-2 border-neon-yellow/30 shadow-inner">
                  <AlertCircle className="w-5 h-5 text-neon-yellow shrink-0" />
                  <p className="text-[10px] font-black text-slate-600 leading-tight uppercase">
                    RECIBIRÁS UNA ALERTA VISUAL AL SUPERAR EL 80% DE ESTE LÍMITE.
                  </p>
                </div>

                <button type="submit" className="clay-button w-full mt-4 bg-indigo-500 text-white font-black uppercase tracking-widest shadow-indigo-100 py-4 text-sm neon-border-cyan border-2">
                  ACTIVAR PROTOCOLO
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {budgets.map((budget, i) => {
          const spent = transactions
            .filter(t => t.category === budget.category && t.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);
          
          const progress = Math.min((spent / budget.amount) * 100, 100);
          const isOverBudget = spent > budget.amount;
          const isNearLimit = spent > budget.amount * 0.8;

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={budget.id} 
              className={cn(
                "clay-card group relative overflow-hidden",
                isOverBudget ? "bg-rose-50 border-rose-100 shadow-rose-100" : "bg-white"
              )}
            >
              {isOverBudget && (
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                  isOverBudget ? "bg-rose-100 text-rose-600" : "bg-indigo-50 text-indigo-500"
                )}>
                  <Wallet className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => handleDelete(budget.id!)}
                  className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-100 transition-all active:scale-90"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                   <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-1">{budget.category}</h4>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Gasto actual</span>
                      <span>Límite total</span>
                   </div>
                </div>
                
                <div className="flex justify-between items-end mb-2">
                  <span className={cn(
                    "text-xl font-black tabular-nums",
                    isOverBudget ? "text-rose-600" : "text-slate-800"
                  )}>
                    {formatCurrency(spent, profile?.preferredCurrency || 'USD')}
                  </span>
                  <span className="text-sm font-bold text-slate-400 tabular-nums">
                    {formatCurrency(budget.amount, profile?.preferredCurrency || 'USD')}
                  </span>
                </div>

                <div className="h-6 w-full bg-slate-50 border border-slate-100 rounded-2xl p-1 relative overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={cn(
                      "h-full rounded-xl transition-all duration-1000",
                      isOverBudget ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]" : 
                      isNearLimit ? "bg-amber-400" : "bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    )}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-600 mix-blend-overlay">
                    {progress.toFixed(0)}% Utilizado
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className={cn(
                    isOverBudget ? "text-rose-600 font-black animate-pulse" : isNearLimit ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {isOverBudget ? "¡Límite Excedido!" : isNearLimit ? "Crítico: Fondos bajos" : "Estado: Seguro"}
                  </span>
                  <span className="text-slate-400">
                    Sobrante: {formatCurrency(Math.max(budget.amount - spent, 0), profile?.preferredCurrency || 'USD')}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {budgets.length === 0 && (
         <div className="text-center py-32 clay-card bg-slate-50/50 border-2 border-dashed border-slate-200 flex flex-col items-center">
           <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-6 shadow-xl">
             <TrendingDown className="w-10 h-10" />
           </div>
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No hay protocolos de control configurados</p>
           <button onClick={() => setShowForm(true)} className="mt-4 text-indigo-500 font-black text-[10px] uppercase underline underline-offset-4">Iniciar ahora</button>
         </div>
      )}
    </div>
  );
};
