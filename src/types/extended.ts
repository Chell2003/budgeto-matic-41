
import { Budget, SavingsGoal, Transaction } from "./database";

// Extended Budget type that includes computed properties
export interface ExtendedBudget extends Budget {
  spent: number;
  color: string;
}

// Extended SavingsGoal type with computed properties
export interface ExtendedSavingsGoal extends SavingsGoal {
  progress: number;
  remaining_amount: number;
  time_remaining: {
    days: number;
    weeks: number;
    months: number;
  };
}

// Extended Transaction type with transaction_type that matches the database version
export interface ExtendedTransaction extends Omit<Transaction, 'transaction_type'> {
  transaction_type?: string;
}
