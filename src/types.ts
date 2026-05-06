export type Currency = 'USD' | 'EUR' | 'MXN' | 'GBP' | 'JPY' | 'CRC';

export interface Profile {
  uid: string;
  userId: string;
  email: string;
  displayName: string;
  preferredCurrency: Currency;
  language: 'es' | 'en';
  createdAt: string;
}

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  currency: Currency;
  category: string;
  type: 'income' | 'expense';
  date: string;
  note?: string;
}

export interface Budget {
  id?: string;
  userId: string;
  category: string;
  amount: number;
  currency: Currency;
  period: 'monthly';
}

export interface SavingsGoal {
  id?: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline?: string;
}

export const CATEGORIES = [
  'Comida', 
  'Vivienda', 
  'Transporte', 
  'Shopping', 
  'Entretenimiento', 
  'Salud', 
  'Salario', 
  'Inversiones', 
  'Otros'
];

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'MXN', 'GBP', 'JPY', 'CRC'];
