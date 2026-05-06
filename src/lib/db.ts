
import Dexie, { Table } from 'dexie';
import { Transaction, Budget, SavingsGoal, Profile } from '../types';

export class ArcadeFinanceDB extends Dexie {
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  goals!: Table<SavingsGoal>;
  profile!: Table<Profile>;

  constructor() {
    super('ArcadeFinanceDB');
    
    // Define table schemas
    // Indexed fields are: id (primary key), userId (for queries), category, date
    this.version(1).stores({
      transactions: '++id, userId, category, date, type',
      budgets: '++id, userId, category',
      goals: '++id, userId, name',
      profile: 'userId' // Primary key for profile
    });
  }
}

export const db = new ArcadeFinanceDB();
