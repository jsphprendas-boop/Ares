import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  Target, 
  Trash2,
  Calendar as CalendarIcon,
  CircleDollarSign,
  TrendingUp,
  ChevronRight,
  Trophy,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { CURRENCIES, SavingsGoal, Currency } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { storageService } from '../services/storageService';

interface GoalsViewProps {
  goals: SavingsGoal[];
}

export const GoalsView = ({ goals }: GoalsViewProps) => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [showVictory, setShowVictory] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [injectValues, setInjectValues] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const parsedTarget = parseFloat(target);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      alert('Por favor ingrese un monto objetivo válido mayor a 0');
      return;
    }

    const newGoal: SavingsGoal = {
      userId: profile.userId || 'local',
      name,
      targetAmount: parsedTarget,
      currentAmount: 0,
      currency: profile?.preferredCurrency || 'USD',
      deadline
    };

    await storageService.saveGoal(newGoal);
    setShowForm(false);
    setName(''); setTarget('');
  };

  const updateGoal = async (goal: SavingsGoal, amount: number) => {
    const wasIncomplete = goal.currentAmount < goal.targetAmount;
    const isNowComplete = amount >= goal.targetAmount;

    const updatedGoal = { ...goal, currentAmount: amount };
    await storageService.saveGoal(updatedGoal);
    if (wasIncomplete && isNowComplete) {
      setShowVictory(updatedGoal);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Deseas eliminar este objetivo?')) {
      await storageService.deleteGoal(id);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center sm:text-left uppercase">{t('missions')}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Metas y objetivos patrimoniales</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="clay-button bg-white text-emerald-600 border-2 neon-border-lime hover:bg-slate-50 shadow-emerald-100"
        >
          <Plus className="w-5 h-5" />
          ESTABLECER META
        </button>
      </div>

      <AnimatePresence>
        {showVictory && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="clay-card max-w-sm w-full bg-white text-center p-12 border-4 border-neon-lime shadow-[0_0_50px_rgba(57,255,20,0.3)]"
            >
              <div className="relative mb-8">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }} 
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute inset-0 bg-neon-lime/10 blur-2xl rounded-full" 
                />
                <Trophy className="w-24 h-24 text-neon-lime mx-auto relative z-10" />
              </div>
              
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-4">MISIÓN CUMPLIDA</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8 leading-tight">
                Has alcanzado tu objetivo estratégico: <br/>
                <span className="text-neon-cyan neon-text-cyan">{showVictory.name}</span>
              </p>

              <div className="flex flex-col gap-4">
                 <div className="p-4 bg-slate-50 rounded-3xl border-2 border-slate-100 shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tesoro Acumulado</p>
                    <div className="text-2xl font-black text-slate-800">{formatCurrency(showVictory.targetAmount, profile?.preferredCurrency || 'USD')}</div>
                 </div>

                 <button 
                  onClick={() => setShowVictory(null)}
                  className="clay-button bg-neon-lime text-slate-900 font-black py-4 uppercase tracking-[0.2em] shadow-[0_5px_0_rgb(34,197,94)]"
                 >
                   CONTINUAR
                 </button>
              </div>
            </motion.div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="clay-card w-full max-w-lg relative bg-white border-2 border-slate-100 shadow-2xl"
            >
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-neon-pink transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">{t('save_mission')}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Define qué quieres lograr y para cuándo</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Objetivo</label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-cyan" />
                    <input required placeholder="E.g. Mi Nuevo Fondo de Emergencia" value={name} onChange={e => setName(e.target.value)} className="clay-input pl-11" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto Objetivo</label>
                    <div className="flex gap-3">
                      <input required type="number" placeholder="0.00" value={target} onChange={e => setTarget(e.target.value)} className="clay-input flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Límite</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-pink" />
                      <input required type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="clay-input pl-11" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="clay-button w-full mt-4 bg-indigo-500 text-white font-black uppercase tracking-widest shadow-indigo-100 py-4 text-sm neon-border-cyan border-2">
                  LANZAR MISIÓN AHORRO
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {goals.map((goal, i) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const currentInjectValue = injectValues[goal.id!] || '';

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={goal.id} 
              className="clay-card border-none hover:shadow-indigo-100 transition-all p-8 flex flex-col sm:flex-row gap-8 relative overflow-hidden group"
            >
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-indigo-50 rounded-full group-hover:scale-125 transition-transform duration-500" />
              
              <div className="flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-[2.5rem] w-full sm:w-40 h-40 shrink-0 relative z-10">
                <span className={cn(
                  "text-3xl font-black mb-1 tabular-nums",
                  progress >= 100 ? "text-emerald-500" : "text-indigo-600"
                )}>
                  {progress.toFixed(0)}<span className="text-sm">%</span>
                </span>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Progreso Actual</p>
                {progress >= 100 && (
                   <div className="absolute top-1 right-1">
                      <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                   </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2 group-hover:text-indigo-600 transition-colors">{goal.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{goal.deadline || 'Sin límite'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(goal.id!)}
                    className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400 underline decoration-slate-200">Ahorrado</span>
                    <span className="text-slate-400">Objetivo</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black text-slate-800 tabular-nums">{formatCurrency(goal.currentAmount, profile?.preferredCurrency || 'USD')}</span>
                    <span className="text-sm font-bold text-slate-400 tabular-nums">{formatCurrency(goal.targetAmount, profile?.preferredCurrency || 'USD')}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={cn("h-full rounded-full", progress >= 100 ? "bg-emerald-400" : "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]")}
                    />
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <div className="relative flex-1">
                    <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={currentInjectValue}
                      onChange={e => setInjectValues({ ...injectValues, [goal.id!]: e.target.value })}
                      className="clay-input pl-9 py-2.5 text-xs border-slate-100"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const val = parseFloat(currentInjectValue);
                      if (val > 0) {
                        updateGoal(goal, goal.currentAmount + val);
                        setInjectValues({ ...injectValues, [goal.id!]: '' });
                      }
                    }}
                    className="clay-button bg-indigo-500 text-white py-2.5 px-6 text-[10px] uppercase font-black hover:bg-indigo-600 shadow-indigo-100 shrink-0"
                  >
                    <Zap className="w-3 h-3 text-neon-yellow fill-current" />
                    INYECTAR
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-32 clay-card bg-slate-50/50 border-2 border-dashed border-slate-200 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-6 shadow-xl">
             <CircleDollarSign className="w-10 h-10" />
          </div>
          <h4 className="text-slate-400 font-black uppercase tracking-widest text-xs">Sin misiones de ahorro activas</h4>
          <p className="text-slate-400 font-medium text-[10px] mt-2 max-w-xs uppercase tracking-tighter">Empieza hoy a planificar tus grandes proyectos</p>
        </div>
      )}
    </div>
  );
};
