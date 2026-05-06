
import { Transaction, Budget, SavingsGoal, Profile } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'arcade_finance_transactions',
  BUDGETS: 'arcade_finance_budgets',
  GOALS: 'arcade_finance_goals',
  PROFILE: 'arcade_finance_profile'
};

export const storageService = {
  // Generic getters/setters
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error parsing data from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  },
  
  set: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        alert('Se ha alcanzado el límite de almacenamiento local. No se pueden guardar más datos.');
      } else {
        console.error('Error guardando en localStorage:', e);
      }
    }
  },

  // Transactions
  getTransactions: (): Transaction[] => storageService.get(STORAGE_KEYS.TRANSACTIONS, []),
  saveTransaction: (tx: Transaction) => {
    const txs = storageService.getTransactions();
    storageService.set(STORAGE_KEYS.TRANSACTIONS, [tx, ...txs]);
  },
  deleteTransaction: (id: string) => {
    const txs = storageService.getTransactions();
    storageService.set(STORAGE_KEYS.TRANSACTIONS, txs.filter(t => t.id !== id));
  },

  // Budgets
  getBudgets: (): Budget[] => storageService.get(STORAGE_KEYS.BUDGETS, []),
  saveBudget: (budget: Budget) => {
    const budgets = storageService.getBudgets();
    const index = budgets.findIndex(b => b.id === budget.id);
    if (index >= 0) budgets[index] = budget;
    else budgets.push(budget);
    storageService.set(STORAGE_KEYS.BUDGETS, budgets);
  },
  deleteBudget: (id: string) => {
    const budgets = storageService.getBudgets();
    storageService.set(STORAGE_KEYS.BUDGETS, budgets.filter(b => b.id !== id));
  },

  // Goals
  getGoals: (): SavingsGoal[] => storageService.get(STORAGE_KEYS.GOALS, []),
  saveGoal: (goal: SavingsGoal) => {
    const goals = storageService.getGoals();
    const index = goals.findIndex(g => g.id === goal.id);
    if (index >= 0) goals[index] = goal;
    else goals.push(goal);
    storageService.set(STORAGE_KEYS.GOALS, goals);
  },
  updateGoalAmount: (id: string, amount: number) => {
    const goals = storageService.getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index >= 0) {
      goals[index].currentAmount += amount;
      storageService.set(STORAGE_KEYS.GOALS, goals);
    }
  },

  deleteGoal: (id: string) => {
    const goals = storageService.getGoals();
    storageService.set(STORAGE_KEYS.GOALS, goals.filter(g => g.id !== id));
  },

  // Profile
  getProfile: (): Profile | null => storageService.get(STORAGE_KEYS.PROFILE, null),
  saveProfile: (profile: Profile) => storageService.set(STORAGE_KEYS.PROFILE, profile)
};
