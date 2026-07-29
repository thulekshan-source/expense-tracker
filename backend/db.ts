import mongoose from "mongoose";
import { ExpenseModel } from "./models/Expense.js";
import type { IExpenseDocument } from "./models/Expense.js";
import type { Expense } from "../frontend/src/types.js";

export async function initDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is missing. Please set your MongoDB Atlas connection string in .env file."
    );
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected successfully to MongoDB Atlas.");
  } catch (error) {
    console.error("MongoDB Atlas connection error:", error);
    throw error;
  }
}

export async function getAllExpenses(): Promise<Expense[]> {
  const docs = await ExpenseModel.find().sort({ date: -1, createdAt: -1 });
  return docs.map((doc: IExpenseDocument) => ({
    id: doc.id,
    date: doc.date,
    category: doc.category as Expense["category"],
    amount: doc.amount,
    note: doc.note,
  }));
}

export async function addExpense(expense: Expense): Promise<Expense> {
  const created = await ExpenseModel.create(expense);
  return {
    id: created.id,
    date: created.date,
    category: created.category as Expense["category"],
    amount: created.amount,
    note: created.note,
  };
}

export async function deleteExpense(id: string): Promise<boolean> {
  const res = await ExpenseModel.deleteOne({ id });
  return res.deletedCount > 0;
}

export async function importExpenses(expenses: Expense[]): Promise<Expense[]> {
  await ExpenseModel.deleteMany({});
  if (expenses.length > 0) {
    await ExpenseModel.insertMany(expenses);
  }
  return getAllExpenses();
}
