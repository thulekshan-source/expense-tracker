import { useState, useMemo } from "react";
import type { Expense, Category } from "./types";
import { CATEGORIES } from "./types";
import { fmt, todayISO, formatHeaderDate, getFilteredExpenses } from "./utils";

type Tab = "daily" | "monthly";

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    date: todayISO(),
    category: "Food",
    amount: 100,
    note: "eat",
  },
  {
    id: "exp-2",
    date: todayISO(),
    category: "Transport",
    amount: 350,
    note: "bus ticket",
  },
  {
    id: "exp-3",
    date: "2026-07-25",
    category: "Utilities",
    amount: 4200,
    note: "electricity bill",
  },
];

export function App() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [activeTab, setActiveTab] = useState<Tab>("daily");

  // Form states
  const [date, setDate] = useState<string>(todayISO());
  const [category, setCategory] = useState<Category>("Food");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const today = todayISO();
  const currentMonth = today.slice(0, 7);

  // Computations
  const todaysExpenses = useMemo(
    () => expenses.filter((e) => e.date === today),
    [expenses, today]
  );

  const todayTotal = useMemo(
    () => todaysExpenses.reduce((s, e) => s + e.amount, 0),
    [todaysExpenses]
  );

  const monthTotal = useMemo(
    () =>
      expenses
        .filter((e) => e.date.slice(0, 7) === currentMonth)
        .reduce((s, e) => s + e.amount, 0),
    [expenses, currentMonth]
  );

  const visibleExpenses = useMemo(
    () => getFilteredExpenses(expenses, activeTab),
    [expenses, activeTab]
  );

  const displayTotal = activeTab === "daily" ? todayTotal : monthTotal;

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const newEntry: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: date || todayISO(),
      category,
      amount: numAmount,
      note: note.trim() ? note.trim() : undefined,
    };

    setExpenses((prev) => [newEntry, ...prev]);
    setAmount("");
    setNote("");
  };

  const handleRemoveEntry = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="receipt">
      {/* Brand Header */}
      <div className="brand">
        <div className="name">LEDGER</div>
        <div className="sub">Personal expense record</div>
      </div>

      <hr className="dash" />

      {/* Metadata Lines */}
      <div className="meta-line">
        <span>DATE</span>
        <span>{formatHeaderDate()}</span>
      </div>
      <div className="meta-line">
        <span>ENTRIES TODAY</span>
        <span>{todaysExpenses.length}</span>
      </div>

      {/* Totals */}
      <div className="totals">
        <div className="total-row">
          <span>Subtotal today</span>
          <span className="amt">{fmt(todayTotal)}</span>
        </div>
        <div className="total-row grand">
          <span>Total this month</span>
          <span className="amt">{fmt(monthTotal)}</span>
        </div>
      </div>

      <hr className="dash" />

      {/* New Entry Form */}
      <div className="section-label">— New entry —</div>

      <form onSubmit={handleAddEntry}>
        <div className="row2">
          <div className="field">
            <label htmlFor="in-date">Date</label>
            <input
              id="in-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="in-cat">Category</label>
            <select
              id="in-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="in-amount">Amount</label>
          <div className="amt-wrap">
            <span>Rs.</span>
            <input
              id="in-amount"
              className="amt-in"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="in-note">Note (optional)</label>
          <input
            id="in-note"
            type="text"
            placeholder="What was it for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn-print"
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Print entry
        </button>
      </form>

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === "daily" ? "active" : ""}`}
          onClick={() => setActiveTab("daily")}
        >
          Daily
        </button>
        <button
          type="button"
          className={`tab ${activeTab === "monthly" ? "active" : ""}`}
          onClick={() => setActiveTab("monthly")}
        >
          Monthly
        </button>
      </div>

      {/* Items Section */}
      <div className="section-label" style={{ marginTop: "20px" }}>
        — {activeTab === "daily" ? "Today's items" : "This Month's items"} —
      </div>

      <div className="items">
        {visibleExpenses.length === 0 ? (
          <div className="empty">
            {activeTab === "daily"
              ? "No entries today."
              : "No entries this month."}
          </div>
        ) : (
          visibleExpenses.map((e) => (
            <div className="item" key={e.id}>
              <div className="name">
                {e.category}
                {e.note && <span className="note">{e.note}</span>}
              </div>
              <div className="amt">{fmt(e.amount)}</div>
              <button
                type="button"
                className="del"
                onClick={() => handleRemoveEntry(e.id)}
                title="Delete entry"
                aria-label="Delete entry"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Stamp Total */}
      <div className="stamp-total">
        <div className="lbl">Balance due</div>
        <div className="val">{fmt(displayTotal)}</div>
      </div>

      {/* Barcode */}
      <div className="barcode"></div>

      {/* Footer */}
      <div className="footer-txt">
        {expenses.length} {expenses.length === 1 ? "entry logged" : "entries logged"}
      </div>
      <div className="footer-txt small">All data stored locally · thank you</div>
    </div>
  );
}

export default App;
