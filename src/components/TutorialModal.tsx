import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, CheckCircle, Target, TrendingDown, ArrowUpCircle, Zap } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
  const { t } = useTranslation();
  const [step, setStep] = React.useState(0);

  const steps = [
    {
      icon: <Bot className="w-12 h-12 text-neon-cyan" />,
      title: "BIENVENIDO A ARCADE PRO",
      desc: "Tu nueva estación financiera interactiva. Aquí tus finanzas se manejan como un progreso de misiones.",
      color: "bg-neon-cyan/10 border-neon-cyan text-neon-cyan"
    },
    {
      icon: <Zap className="w-12 h-12 text-neon-pink" />,
      title: "TRANSACCIONES RÁPIDAS",
      desc: "Usa el panel de la izquierda en tu Dashboard para registrar gastos rápidamente. Selecciona una categoría, un monto y 'Detener Fuga'.",
      color: "bg-neon-pink/10 border-neon-pink text-neon-pink"
    },
    {
      icon: <Target className="w-12 h-12 text-neon-lime" />,
      title: "MISIONES Y PRESUPUESTOS",
      desc: "Fija presupuestos mensuales como escudos antimisiles, y misiones de ahorro para tus grandes objetivos.",
      color: "bg-neon-lime/10 border-neon-lime text-neon-lime"
    },
    {
      icon: <ArrowUpCircle className="w-12 h-12 text-indigo-500" />,
      title: "NIVEL DE CUENTA",
      desc: "Tus ingresos (transacciones tipo 'income') suman puntos de XP. Cada 500 subes de nivel y demuestras tu disciplina.",
      color: "bg-indigo-500/10 border-indigo-500 text-indigo-500"
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="clay-card border-none bg-slate-900 border border-slate-700 p-8 w-full max-w-lg relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-lime" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full hover:bg-rose-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center w-full"
            >
              <div className={`p-6 rounded-3xl border-2 mb-6 ${steps[step].color} shadow-lg`}>
                {steps[step].icon}
              </div>
              <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{steps[step].title}</h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm mb-8">
                {steps[step].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-neon-cyan' : 'w-2 bg-slate-700'}`} 
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                disabled={step === 0}
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase text-slate-400 bg-slate-800 hover:text-white disabled:opacity-30 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={() => {
                  if (step < steps.length - 1) {
                    setStep(s => s + 1);
                  } else {
                    onClose();
                  }
                }}
                className="px-6 py-2 rounded-xl text-xs font-black uppercase text-slate-900 bg-neon-cyan hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
              >
                {step < steps.length - 1 ? 'Siguiente' : '¡A Jugar!'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
