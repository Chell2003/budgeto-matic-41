
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

// Extended Transaction type that might include transaction_type
export interface ExtendedTransaction extends Transaction {
  transaction_type?: string;
}
