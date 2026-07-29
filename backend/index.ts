import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

import cors from "cors";
import {
  initDb,
  getAllExpenses,
  addExpense,
  deleteExpense,
  importExpenses,
} from "./db.js";
import express, { Request, Response } from "express";
import type { Expense } from "../frontend/src/types.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure DB is initialized for serverless functions
app.use(async (_req, _res, next) => {
  try {
    await initDb();
    next();
  } catch (err) {
    next(err);
  }
});

// Health check
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

// POST import expenses (must be before /:id routes)
app.post("/api/expenses/import", async (req: Request, res: Response) => {
  try {
    const expenses = req.body;
    if (!Array.isArray(expenses)) {
      res.status(400).json({ error: "Expected an array of expenses" });
      return;
    }
    const imported = await importExpenses(expenses);
    res.json(imported);
  } catch (error) {
    console.error("Error importing expenses:", error);
    res.status(500).json({ error: "Failed to import expenses" });
  }
});

// POST new expense
app.post("/api/expenses", async (req: Request, res: Response) => {
  try {
    const { date, category, amount, note } = req.body;
    if (!date || !category || amount === undefined) {
      res.status(400).json({ error: "Date, category, and amount are required" });
      return;
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
    const id = String(req.params.id);
    const deleted = await deleteExpense(id);
    if (!deleted) {
      res.status(404).json({ error: "Expense not found" });
      return;
    }
    res.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// Initialize database and start server (only locally)
if (process.env.NODE_ENV !== "production") {
  initDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
      });
    })
    .catch((err: unknown) => {
      console.error("Failed to initialize database:", err);
      process.exit(1);
    });
}

export default app;
