import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });
import fs from 'fs';
if (!fs.existsSync(envPath)) { console.error('.env file not found at', envPath); }
import cors from "cors";
import {
  initDb,
  getAllExpenses,
  addExpense,
  deleteExpense,
  importExpenses,
} from "./db";
import express, { Request, Response } from "express";
import type { Expense } from "../frontend/src/types";
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET all expenses
app.get("/api/expenses", async (_req: Request, res: Response) => {
  try {
    const expenses = await getAllExpenses();
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST new expense
app.post("/api/expenses", async (req: Request, res: Response) => {
  try {
    const { date, category, amount, note } = req.body;
    if (!date || !category || amount === undefined) {
      return res
        .status(400)
        .json({ error: "Date, category, and amount are required" });
    }

    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newExpense: Expense = {
      id,
      date,
      category,
      amount: Number(amount),
      note: note || "",
    };

    const created = await addExpense(newExpense);
    res.status(201).json(created);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// DELETE expense by id
app.delete("/api/expenses/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteExpense(id);
    if (!deleted) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// POST import expenses (bulk replace)
app.post("/api/expenses/import", async (req: Request, res: Response) => {
  try {
    const expenses = req.body;
    if (!Array.isArray(expenses)) {
      return res.status(400).json({ error: "Expected an array of expenses" });
    }
    const imported = await importExpenses(expenses);
    res.json(imported);
  } catch (error) {
    console.error("Error importing expenses:", error);
    res.status(500).json({ error: "Failed to import expenses" });
  }
});

// Initialize database and start Express server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
