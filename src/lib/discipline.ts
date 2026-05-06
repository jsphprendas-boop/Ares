import { Transaction, Budget, SavingsGoal } from '../types';

export type Rank = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface DisciplineStats {
  rank: Rank;
  score: number;
  message: string;
  color: string;
}

export const calculateDiscipline = (
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[]
): DisciplineStats => {
  if (transactions.length === 0 && budgets.length === 0 && goals.length === 0) {
    return { rank: 'D', score: 0, message: 'Registra tus primeros movimientos para evaluar tu disciplina.', color: 'bg-slate-400 text-white' };
  }

  let score = 70; // Baseline score (C)

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');
  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);

  // 1. Budget Adherence (40 points cap, but extra for under budget)
  if (budgets.length > 0) {
    let budgetPenalty = 0;
    budgets.forEach(b => {
      const spent = expenses
        .filter(t => t.category === b.category)
        .reduce((acc, t) => acc + t.amount, 0);
      if (spent > b.amount) {
        budgetPenalty += 15;
      } else if (spent < b.amount * 0.8) {
        score += 10; // Reward for staying well under budget
      }
    });
    score -= Math.min(budgetPenalty, 40);
  }

  // 2. Savings Ratio (30 points + bonus)
  if (totalIncome > 0) {
    const savingsRatio = (totalIncome - totalExpenses) / totalIncome;
    if (savingsRatio > 0.5) score += 30;
    else if (savingsRatio > 0.3) score += 20;
    else if (savingsRatio > 0.1) score += 10;
    else if (savingsRatio < 0) score -= 20;
  }

  // 3. Goal Progress (30 points)
  if (goals.length > 0) {
    const avgProgress = goals.reduce((acc, g) => acc + (Math.min(g.currentAmount / g.targetAmount, 1)), 0) / goals.length;
    score += avgProgress * 30;
  }

  // 4. Essential vs Non-essential Expenses
  const essentialCategories = ['Vivienda', 'Comida', 'Salud', 'Transporte'];
  const discretionaryCategories = ['Shopping', 'Entretenimiento', 'Otros'];
  
  const essentialExpenses = expenses
     .filter(t => essentialCategories.includes(t.category))
     .reduce((acc, t) => acc + t.amount, 0);

  const discretionaryExpenses = expenses
     .filter(t => discretionaryCategories.includes(t.category))
     .reduce((acc, t) => acc + t.amount, 0);

  let discretionaryRatio = 0;
  let hasLeak = false;
  let goodManagement = false;

  if (totalIncome > 0) {
     discretionaryRatio = discretionaryExpenses / totalIncome;
     const essentialRatio = essentialExpenses / totalIncome;

     if (discretionaryRatio > 0.4) {
        score -= 40;
        hasLeak = true;
     } else if (discretionaryRatio > 0.25) {
        score -= 20;
        hasLeak = true;
     } else if (discretionaryRatio <= 0.15) {
        score += 15;
        goodManagement = true;
     }

     if (essentialRatio <= 0.5 && essentialRatio > 0) {
        score += 10; // Bien gestionados los gastos fijos
     } else if (essentialRatio > 0.8) {
        score -= 20; // Gastos fijos asfixiantes
     }
  } else if (discretionaryExpenses > 0) {
     score -= 30;
     hasLeak = true;
  }

  // Final Rank determination
  let rank: Rank = 'C';
  let message = 'Buen comienzo. Mantén el enfoque en tus límites.';
  let color = 'bg-slate-400 text-white';

  if (score >= 110) {
    rank = 'S+';
    message = 'NIVEL: LEYENDA. Dominio absoluto. Tus gastos innecesarios son mínimos y tus finanzas impecables.';
    color = 'bg-amber-400 text-slate-900 shadow-[0_0_15px_#fbbf24]';
  } else if (score >= 95) {
    rank = 'S';
    message = goodManagement ? 'NIVEL: GRANDMASTER. Excelente balance entre gastos necesarios y ahorros.' : 'NIVEL: GRANDMASTER. Has alcanzado la iluminación financiera.';
    color = 'bg-neon-yellow text-slate-900';
  } else if (score >= 85) {
    rank = 'A';
    message = goodManagement ? 'NIVEL: BUENA. Limitas muy bien los gastos malos. Tu gestión es eficiente.' : 'NIVEL: BUENA. Tu gestión de recursos es impecable y eficiente.';
    color = 'bg-neon-lime text-slate-900';
  } else if (score >= 75) {
    rank = 'B';
    message = 'NIVEL: ESTABLE. Cubres tus necesidades y mantienes a raya los antojos innecesarios.';
    color = 'bg-neon-cyan text-slate-900';
  } else if (score >= 60) {
    rank = 'C';
    message = hasLeak ? 'NIVEL: REGULAR. Cuidado, demasiados "gastos malos" (entretenimiento/compras) minan tu oro.' : 'NIVEL: REGULAR. Mantienes el ritmo, pero hay margen de optimización en gastos fijos.';
    color = 'bg-slate-400 text-white';
  } else if (score >= 40) {
    rank = 'D';
    message = hasLeak ? 'NIVEL: MALA. Urgente: recorta gastos innecesarios. Tus "malos hábitos" absorben tu dinero.' : 'NIVEL: MALA. Tus gastos necesarios superan por mucho a tus ingresos.';
    color = 'bg-neon-pink text-white';
  } else {
    rank = 'F';
    message = hasLeak ? 'NIVEL: CRÍTICA. Exceso de gastos innecesarios. Tienes que frenar las compras impulsivas ya.' : 'NIVEL: CRÍTICA. Brecha de contención rota. Reinicio requerido.';
    color = 'bg-rose-600 text-white';
  }

  return { rank, score: Math.max(score, 0), message, color };
};
