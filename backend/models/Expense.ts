import mongoose, { Schema, Document } from "mongoose";
import type { Expense } from "../../frontend/src/types.js";

export interface IExpenseDocument extends Omit<Expense, "id">, Document {
  id: string;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

export const ExpenseModel = mongoose.model<IExpenseDocument>(
  "Expense",
  ExpenseSchema
);
