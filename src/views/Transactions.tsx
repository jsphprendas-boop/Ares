import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Trash2,
  Calendar,
  MessageSquare,
  DollarSign,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { CATEGORIES, CURRENCIES, Transaction, Currency } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { storageService } from '../services/storageService';

interface TransactionsViewProps {
  transactions: Transaction[];
}

export const TransactionsView = ({ transactions }: TransactionsViewProps) => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const exportCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Monto', 'Moneda', 'Nota'];
    const rows = transactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.type === 'income' ? 'Ingreso' : 'Gasto',
      t(tx.category as any) || tx.category,
      tx.amount,
      profile?.preferredCurrency || 'USD',
      tx.note || ''
    ]);

    const escapeCSV = (str: string) => {
      if (!str) return '""';
      const s = String(str);
      // Prepend space to prevent CSV injection for formulas
      const safeStr = s.replace(/^[=+\-@\t\r]/, ' $&');
      return `"${safeStr.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(item => escapeCSV(String(item))).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transacciones.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = (tx.note || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t(tx.category as any).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' ? true : tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingrese un monto válido mayor a 0');
      return;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      userId: profile.userId || 'local',
      amount: parsedAmount,
      currency: profile?.preferredCurrency || 'USD',
      category,
      type,
      date: new Date().toISOString(),
      note
    };

    storageService.saveTransaction(newTransaction);
    setShowForm(false);
    setAmount('');
    setNote('');
    window.location.reload();
  };

  const handleDelete = (id: string) => {
    storageService.deleteTransaction(id);
    window.location.reload();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{t('history')}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Control total de tus movimientos</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="clay-button bg-white text-indigo-600 border-2 neon-border-cyan hover:bg-slate-50 shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          {t('add_log')}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="clay-card w-full max-w-md relative bg-white border-2 border-slate-100 shadow-2xl"
            >
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-neon-pink transition-colors">
                <X className="w-6 h-6" />
              </button>
              
                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">{t('add_log')}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Graba un nuevo movimiento financiero</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner">
                  <button 
                    type="button" 
                    onClick={() => setType('expense')} 
                    className={cn(
                      "py-3 rounded-xl font-black text-xs transition-all uppercase tracking-tight",
                      type === 'expense' ? "bg-white text-neon-pink shadow-sm neon-border-pink border-2" : "text-slate-400 border-2 border-transparent"
                    )}
                  >
                    Gastos
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setType('income')} 
                    className={cn(
                      "py-3 rounded-xl font-black text-xs transition-all uppercase tracking-tight",
                      type === 'income' ? "bg-white text-neon-lime shadow-sm border-neon-lime border-2" : "text-slate-400 border-2 border-transparent"
                    )}
                  >
                    Ingresos
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('amount')}</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-cyan" />
                      <input required type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="clay-input pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('category')}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Comida', 'Transporte', 'Entretenimiento', 'Salud'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all",
                          category === cat ? "bg-indigo-500 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {t(cat as any)}
                      </button>
                    ))}
                  </div>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="clay-input">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{t(cat as any)}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('note')}</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Descripción opcional" className="clay-input pl-10 min-h-[100px] resize-none"></textarea>
                  </div>
                </div>

                <button type="submit" className="clay-button w-full mt-4 bg-indigo-500 text-white font-black uppercase tracking-widest shadow-indigo-100 py-4 text-sm neon-border-cyan border-2">
                  EJECUTAR REGISTRO
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Analytics Mini-Cards */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="clay-card border-none bg-emerald-500 text-white p-5 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><ArrowDownCircle className="w-12 h-12" /></div>
             <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">Ingresos Totales</span>
             <span className="text-2xl font-black tracking-tighter">
               {formatCurrency(transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0), profile?.preferredCurrency || 'USD')}
             </span>
          </div>
          <div className="clay-card border-none bg-rose-500 text-white p-5 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><ArrowUpCircle className="w-12 h-12" /></div>
             <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">Gastos Totales</span>
             <span className="text-2xl font-black tracking-tighter">
               {formatCurrency(transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0), profile?.preferredCurrency || 'USD')}
             </span>
          </div>
          <div className="clay-card border-none bg-slate-900 text-white p-5 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-12 h-12 text-neon-cyan" /></div>
             <span className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">Neto Generado</span>
             <span className="text-2xl font-black tracking-tighter text-neon-cyan neon-text-cyan">
               {formatCurrency(
                 transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) -
                 transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
                 profile?.preferredCurrency || 'USD'
               )}
             </span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm">
           <div className="flex w-full sm:w-auto items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 flex-1">
             <Search className="w-4 h-4 text-slate-400" />
             <input 
               type="text"
               placeholder="Buscar nota o categoría..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 w-full placeholder:text-slate-400 placeholder:font-medium"
             />
           </div>
           
           <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
             <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
             {(['all', 'income', 'expense'] as const).map(fType => (
               <button
                 key={fType}
                 onClick={() => setFilterType(fType)}
                 className={cn(
                   "px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight whitespace-nowrap transition-all",
                   filterType === fType ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                 )}
               >
                 {fType === 'all' ? 'Todos' : fType === 'income' ? 'Ingresos' : 'Gastos'}
               </button>
             ))}
             
             <button
               onClick={exportCSV}
               className="ml-auto sm:ml-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-1 shrink-0"
               title="Exportar a CSV"
             >
               <Download className="w-4 h-4" />
               <span className="hidden sm:inline">CSV</span>
             </button>
           </div>
        </div>
      )}

      <div className="clay-card border-none p-0 overflow-hidden bg-white/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalle</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((tx, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={tx.id || i} 
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="p-6 text-sm font-bold text-slate-400 tabular-nums">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2 items-center">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight inline-block",
                        tx.type === 'income' ? "bg-neon-lime/20 text-emerald-600 shadow-[0_0_8px_rgba(57,255,20,0.3)]" : 
                        ['Vivienda', 'Comida', 'Salud', 'Transporte'].includes(tx.category) ? "bg-blue-50 text-indigo-600 shadow-sm" :
                        "bg-rose-50 text-rose-600 shadow-sm"
                      )}>
                        {t(tx.category as any)}
                      </span>
                      {tx.type === 'expense' && ['Shopping', 'Entretenimiento', 'Otros'].includes(tx.category) && (
                         <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter bg-amber-100 text-amber-600 border border-amber-200 shadow-sm animate-in fade-in zoom-in slide-in-from-left-1">Gasto Hormiga 🐜</span>
                      )}
                      {tx.type === 'expense' && ['Vivienda', 'Comida', 'Salud', 'Transporte'].includes(tx.category) && (
                         <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter bg-cyan-50 text-cyan-500 border border-cyan-100 shadow-sm animate-in fade-in zoom-in slide-in-from-left-1">Necesario ✔️</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-500 max-w-[200px] truncate">{tx.note || '---'}</td>
                  <td className={cn(
                    "p-6 text-right font-black text-base tracking-tight tabular-nums",
                    tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, profile?.preferredCurrency || 'USD')}
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleDelete(tx.id!)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
               <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                  <ArrowUpCircle className="w-10 h-10" />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Aún no hay transacciones registradas</p>
            </div>
          )}
          {transactions.length > 0 && filteredTransactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
               <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                  <Search className="w-10 h-10" />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No hay resultados para la búsqueda actual</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
