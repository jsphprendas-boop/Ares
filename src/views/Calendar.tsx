import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { CATEGORIES, Transaction } from '../types';
import { cn } from '../lib/utils';
import { storageService } from '../services/storageService';

interface CalendarViewProps {
  transactions: Transaction[];
}

export const CalendarView = ({ transactions }: CalendarViewProps) => {
  const { profile } = useAuth();
  const { t, lang } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [note, setNote] = useState('');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthNames = lang === 'es' 
    ? ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dailyTransactions = transactions.filter(t => t.date.split('T')[0] === selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedDate) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingrese un monto válido mayor a 0');
      return;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      userId: profile.userId || 'local',
      amount: parsedAmount,
      currency: profile.preferredCurrency || 'USD',
      category,
      type,
      date: new Date(selectedDate).toISOString(),
      note
    };

    storageService.saveTransaction(newTransaction);
    setShowForm(false);
    setAmount('');
    setNote('');
    window.location.reload();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 pb-12">
      {/* Calendar Grid */}
      <div className="lg:col-span-8 clay-card border-none bg-white relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="flex justify-between items-center mb-10 relative z-10">
          <button onClick={prevMonth} className="p-3 bg-white rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-neon-cyan transition-all border-2 border-slate-50 shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase underline decoration-neon-cyan/30 decoration-8 underline-offset-4">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button onClick={nextMonth} className="p-3 bg-white rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-neon-pink transition-all border-2 border-slate-50 shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-3 mb-4 relative z-10">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(d => (
            <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-2">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-3 relative z-10">
          {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          
          {Array(daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())).fill(null).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasActivity = transactions.some(t => t.date.split('T')[0] === dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <button 
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-2xl border-2 text-sm font-black transition-all relative group overflow-hidden",
                  isSelected 
                    ? "bg-slate-50 text-indigo-600 neon-border-cyan border-2 shadow-inner" 
                    : "bg-white border-slate-50 text-slate-400 hover:border-indigo-100 hover:bg-slate-50 shadow-sm"
                )}
              >
                <span className={cn("relative z-10", isSelected && "neon-text-cyan scale-110")}>{day}</span>
                {hasActivity && !isSelected && (
                  <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full mt-1 shadow-[0_0_8px_rgba(0,255,255,1)]" />
                )}
                {isSelected && (
                  <motion.div layoutId="day-glow" className="absolute inset-0 bg-neon-cyan/5 blur-lg rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day View */}
      <div className="lg:col-span-4 flex flex-col gap-8">
        <div className="clay-card border-2 neon-border-pink bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-pink/5 blur-3xl rounded-full translate-x-12 -translate-y-12" />
          <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-neon-pink" />
            {t('agenda')}
          </h4>
          <p className="text-xl font-black tracking-tight mb-8 tabular-nums text-slate-800 underline decoration-neon-pink/20 decoration-4 underline-offset-4">{selectedDate}</p>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {dailyTransactions.length === 0 ? (
              <div className="text-[10px] font-black text-slate-400 uppercase py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 shadow-inner italic">
                Sin actividad registrada
              </div>
            ) : (
              dailyTransactions.map((tx, idx) => (
                <div key={idx} className="flex flex-col p-4 rounded-2xl bg-white border-2 border-slate-50 group transition-all hover:bg-slate-50 hover:border-slate-100 shadow-sm">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{t(tx.category as any)}</span>
                      <span className={cn("text-sm font-black tabular-nums", tx.type === 'income' ? "text-neon-lime neon-text-lime" : "text-neon-pink neon-text-pink")}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount}
                      </span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate opacity-60 group-hover:opacity-100">{tx.note || 'Sin descripción'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className="clay-button bg-white text-indigo-600 border-2 neon-border-cyan py-5 uppercase tracking-widest shadow-indigo-50 font-black text-xs"
        >
          <Plus className="w-5 h-5" />
          {t('add_log')}
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
              
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">REGISTRO DIARIO</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 underline decoration-indigo-100 decoration-4 underline-offset-4">Fecha: {selectedDate}</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner">
                  <button type="button" onClick={() => setType('expense')} className={cn("py-3 rounded-xl font-black text-xs transition-all uppercase tracking-tight", type === 'expense' ? "bg-white text-neon-pink shadow-sm border-neon-pink border-2" : "text-slate-400")}>Gasto</button>
                  <button type="button" onClick={() => setType('income')} className={cn("py-3 rounded-xl font-black text-xs transition-all uppercase tracking-tight", type === 'income' ? "bg-white text-neon-lime shadow-sm border-neon-lime border-2" : "text-slate-400")}>Ingreso</button>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto Estimado</label>
                   <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-cyan" />
                      <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="clay-input pl-11" placeholder="0.00" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificador de Categoría</label>
                   <select value={category} onChange={e => setCategory(e.target.value)} className="clay-input">
                     {CATEGORIES.map(cat => <option key={cat} value={cat}>{t(cat as any)}</option>)}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nota del Evento</label>
                   <div className="relative">
                      <MessageSquare className="absolute left-4 top-5 w-4 h-4 text-slate-300" />
                      <input value={note} onChange={e => setNote(e.target.value)} className="clay-input pl-11 h-16" placeholder="¿En qué consistió este gasto?" />
                   </div>
                </div>

                <button type="submit" className="clay-button w-full mt-4 bg-indigo-500 text-white font-black uppercase tracking-widest shadow-indigo-100 py-4 text-sm neon-border-cyan border-2">
                  CONFIRMAR REGISTRO
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
