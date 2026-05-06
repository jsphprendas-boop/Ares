
import { db } from '../lib/db';
import { Transaction, Budget, SavingsGoal, Profile } from '../types';

export const storageService = {
  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    return await db.transactions.orderBy('date').reverse().toArray();
  },
  saveTransaction: async (tx: Transaction) => {
    return await db.transactions.add(tx);
  },
  deleteTransaction: async (id: number) => {
    return await db.transactions.delete(id);
  },

  // Budgets
  getBudgets: async (): Promise<Budget[]> => {
    return await db.budgets.toArray();
  },
  saveBudget: async (budget: Budget) => {
    if (budget.id) {
      return await db.budgets.put(budget);
    } else {
      return await db.budgets.add(budget);
    }
  },
  deleteBudget: async (id: number) => {
    return await db.budgets.delete(id);
  },

  // Goals
  getGoals: async (): Promise<SavingsGoal[]> => {
    return await db.goals.toArray();
  },
  saveGoal: async (goal: SavingsGoal) => {
    if (goal.id) {
      return await db.goals.put(goal);
    } else {
      return await db.goals.add(goal);
    }
  },
  updateGoalAmount: async (id: number, amount: number) => {
    const goal = await db.goals.get(id);
    if (goal) {
      return await db.goals.update(id, { currentAmount: goal.currentAmount + amount });
    }
  },
  deleteGoal: async (id: number) => {
    return await db.goals.delete(id);
  },

  // Profile
  getProfile: async (): Promise<Profile | undefined> => {
    const profiles = await db.profile.toArray();
    return profiles[0];
  },
  saveProfile: async (profile: Profile) => {
    return await db.profile.put(profile);
  }
};
