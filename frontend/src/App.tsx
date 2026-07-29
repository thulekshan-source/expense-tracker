import { useState, useMemo, useEffect } from "react";
import type { Expense, Category } from "./types";
import { CATEGORIES } from "./types";
import { fmt, todayISO, getFilteredExpenses } from "./utils";
import { fetchExpenses, createExpense, deleteExpense } from "./api";

// ── Constants ──────────────────────────────────────────────────────────
const SALARY_KEY = "ledger_monthly_salary";

const CAT_META: Record<Category, { icon: string; color: string; bg: string }> = {
  Food:      { icon: "🍔", color: "#F97316", bg: "rgba(249,115,22,0.15)" },
  Transport: { icon: "🚌", color: "#4F8EF7", bg: "rgba(79,142,247,0.15)" },
  Utilities: { icon: "⚡", color: "#FBBF24", bg: "rgba(251,191,36,0.15)" },
  Rent:      { icon: "🏠", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" },
  Health:    { icon: "💊", color: "#22C55E", bg: "rgba(34,197,94,0.15)"  },
  Other:     { icon: "📦", color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
};

type Tab = "daily" | "monthly";
type Sheet = "none" | "add" | "salary";

// ── App ────────────────────────────────────────────────────────────────
export function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("daily");
  const [sheet, setSheet] = useState<Sheet>("none");

  // Salary
  const [salary, setSalary] = useState<number>(() => {
    const s = localStorage.getItem(SALARY_KEY);
    return s ? parseFloat(s) : 0;
  });
  const [salaryInput, setSalaryInput] = useState<string>("");

  // Add form
  const [date, setDate] = useState<string>(todayISO());
  const [category, setCategory] = useState<Category>("Food");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const today = todayISO();
  const currentMonth = today.slice(0, 7);

  // ── Month display for header ─────────────────────────────────────────

  useEffect(() => {
    fetchExpenses()
      .then((data) => setExpenses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Computed values ─────────────────────────────────────────────────
  const todaysExpenses = useMemo(
    () => expenses.filter((e) => e.date === today),
    [expenses, today]
  );

  const todayTotal = useMemo(
    () => todaysExpenses.reduce((s, e) => s + e.amount, 0),
    [todaysExpenses]
  );

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.slice(0, 7) === currentMonth),
    [expenses, currentMonth]
  );

  const monthTotal = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses]
  );

  const visibleExpenses = useMemo(
    () => getFilteredExpenses(expenses, activeTab),
    [expenses, activeTab]
  );

  const remaining = salary > 0 ? salary - monthTotal : null;
  const spentPct = salary > 0 ? Math.min((monthTotal / salary) * 100, 100) : 0;
  const isOverBudget = salary > 0 && monthTotal > salary;
  const barClass = isOverBudget ? "danger" : spentPct > 75 ? "warn" : "safe";

  // ── Handlers ────────────────────────────────────────────────────────
  const openAdd = () => {
    setDate(todayISO());
    setCategory("Food");
    setAmount("");
    setNote("");
    setSheet("add");
  };

  const openSalary = () => {
    setSalaryInput(salary > 0 ? String(salary) : "");
    setSheet("salary");
  };

  const closeSalary = () => {
    const val = parseFloat(salaryInput);
    if (!isNaN(val) && val > 0) {
      setSalary(val);
      localStorage.setItem(SALARY_KEY, String(val));
    }
    setSheet("none");
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    try {
      const created = await createExpense({
        date: date || todayISO(),
        category,
        amount: numAmount,
        note: note.trim() || undefined,
      });
      setExpenses((prev) => [created, ...prev]);
      setSheet("none");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="splash">
        <div className="splash-logo">Ledger</div>
        <div className="spinner" />
        <div className="splash-sub">Connecting to server…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="splash">
        <div className="splash-logo">Ledger</div>
        <div className="splash-sub" style={{ color: "var(--red)" }}>{error}</div>
      </div>
    );
  }

  // ── Format short currency ────────────────────────────────────────────

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Scrollable content ─────────────────────────────────── */}
      <div className="scroll-area">

        {/* ── Balance Card ────────────────────────────────────────── */}
        <div className="balance-card">
          <div className="balance-label">Balance Remaining</div>
          <div className="balance-amount">
            <span className="currency">Rs.</span>
            {remaining !== null ? remaining.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </div>

          <div className="balance-row">
            <div className="balance-stat">
              <span className="bs-label">Spent</span>
              <span className="bs-val">{monthTotal.toLocaleString("en-LK")}</span>
            </div>
            <div className="balance-stat">
              <span className="bs-label">Salary</span>
              <span className="bs-val">{salary > 0 ? salary.toLocaleString("en-LK") : "0"}</span>
            </div>
            <div className="balance-stat">
              <span className="bs-label">Today</span>
              <span className="bs-val">{todayTotal.toLocaleString("en-LK")}</span>
            </div>
          </div>

          <div className="card-budget-bar">
            <div className="card-budget-bar-track">
              <div 
                className={`card-budget-bar-fill ${barClass}`} 
                style={{ width: `${spentPct}%` }}
              />
            </div>
            <div className="card-budget-pct">
              {Math.round(spentPct)}% of salary used
            </div>
          </div>
        </div>

        {/* ── TRANSACTIONS VIEW (Visible below card) ───────────────── */}
        <div style={{ marginTop: 24 }}>
          <div className="section-header">
            <span className="section-title">Transactions</span>
          </div>

          <div className="txn-list">
            {visibleExpenses.length === 0 ? (
              <div className="txn-empty">
                <div className="txn-empty-icon">
                  {activeTab === "daily" ? "☀️" : "📅"}
                </div>
                <span>
                  {activeTab === "daily" ? "No expenses today" : "No expenses this month"}
                </span>
              </div>
            ) : (
              visibleExpenses.map((e) => (
                <TxnRow key={e.id} expense={e} onDelete={handleDelete} />
              ))
            )}
          </div>
          <div style={{ height: 24 }} />
        </div>
      </div>

      {/* ── FAB ────────────────────────────────────────────────── */}
      {/* ── Bottom Nav ─────────────────────────────────────────── */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={() => openAdd()}>
          <div className="nav-icon">
            <img src="/icons/add.png" alt="Add" width={28} height={28} onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '➕'; }} />
          </div>
          <span className="nav-label">Add</span>
        </button>
        <button className="nav-item" onClick={() => openSalary()}>
          <div className="nav-icon">
            <img src="/icons/salary.png" alt="Salary" width={28} height={28} onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '💼'; }} />
          </div>
          <span className="nav-label">Salary</span>
        </button>
        <button className={`nav-item ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab("monthly")}>
          <div className="nav-icon">
            <img src="/icons/monthly.png" alt="Monthly" width={28} height={28} onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '📅'; }} />
          </div>
          <span className="nav-label">Monthly</span>
        </button>
        <button className={`nav-item ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab("daily")}>
          <div className="nav-icon">
            <img src="/icons/today.png" alt="Today" width={28} height={28} onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '📊'; }} />
          </div>
          <span className="nav-label">Today</span>
        </button>
      </div>

      {/* ── Add Expense Sheet ───────────────────────────────────── */}
      {sheet === "add" && (
        <div className="sheet-overlay" onClick={() => setSheet("none")}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">Add Expense</div>

            <form onSubmit={handleAddEntry}>
              {/* Amount */}
              <div className="form-field">
                <label className="form-label">Amount</label>
                <div className="form-input-prefix-wrap">
                  <span className="form-input-prefix">Rs.</span>
                  <input
                    id="in-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-input"
                    autoFocus
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="form-field">
                <label className="form-label">Category</label>
              </div>
              <div className="cat-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    id={`cat-${cat}`}
                    className={`cat-btn ${category === cat ? "selected" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    <span className="cat-btn-icon">{CAT_META[cat].icon}</span>
                    <span className="cat-btn-label">{cat}</span>
                  </button>
                ))}
              </div>

              {/* Date + Note */}
              <div className="form-row">
                <div>
                  <label className="form-label" style={{ paddingLeft: 0, marginBottom: 8, display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Date</label>
                  <input
                    id="in-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ paddingLeft: 0, marginBottom: 8, display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Note</label>
                  <input
                    id="in-note"
                    type="text"
                    placeholder="Optional"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-add-expense"
                className="sheet-submit"
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Salary Sheet ──────────────────────────────────────── */}
      {sheet === "salary" && (
        <div className="sheet-overlay" onClick={() => setSheet("none")}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">Monthly Salary</div>

            <div className="form-field">
              <label className="form-label">Your monthly income</label>
              <div className="form-input-prefix-wrap">
                <span className="form-input-prefix">Rs.</span>
                <input
                  id="in-salary"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  className="form-input"
                  autoFocus
                  inputMode="decimal"
                />
              </div>
            </div>

            <div style={{ padding: "0 24px 8px", fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>
              Your salary is saved on this device only and used to calculate how much budget you have left each month.
            </div>

            <button
              type="button"
              id="btn-save-salary"
              className="sheet-submit"
              onClick={closeSalary}
            >
              Save Salary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Transaction Row Component ──────────────────────────────────────────
function TxnRow({ expense: e, onDelete }: { expense: Expense; onDelete: (id: string) => void }) {
  const meta = CAT_META[e.category];
  return (
    <div className="txn-item">
      <div className="txn-icon" style={{ background: meta.bg }}>
        {meta.icon}
      </div>
      <div className="txn-info">
        <div className="txn-cat">{e.category}</div>
        {e.note && <div className="txn-note">{e.note}</div>}
        <div className="txn-date">{formatDate(e.date)}</div>
      </div>
      <div className="txn-right">
        <div className="txn-amount">-{fmt(e.amount)}</div>
        <button
          type="button"
          className="txn-del"
          onClick={() => onDelete(e.id)}
          aria-label="Delete"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (iso === today) return "Today";
  if (iso === yesterday) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default App;
