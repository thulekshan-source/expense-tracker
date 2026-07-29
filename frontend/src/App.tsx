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
  const [activeNav, setActiveNav] = useState<"home" | "transactions">("home");
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
  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

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
        <div className="splash-sub">Loading your finances…</div>
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
  const fmtShort = (n: number) =>
    "Rs. " + n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Scrollable content ─────────────────────────────────── */}
      <div className="scroll-area">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting">
            <span className="topbar-hello">Good {getGreeting()},</span>
            <span className="topbar-name">My Finances</span>
          </div>
          <div className="topbar-avatar">💰</div>
        </div>

        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-label">
            {salary > 0 ? "Balance Remaining" : "Spent This Month"}
          </div>
          <div className="balance-amount">
            <span className="currency">Rs.</span>
            {salary > 0
              ? Math.abs(remaining!).toLocaleString("en-LK", { minimumFractionDigits: 2 })
              : monthTotal.toLocaleString("en-LK", { minimumFractionDigits: 2 })
            }
          </div>

          <div className="balance-row">
            <div className="balance-stat">
              <span className="bs-label">Spent</span>
              <span className="bs-val">
                {monthTotal.toLocaleString("en-LK", { minimumFractionDigits: 0 })}
              </span>
            </div>
            {salary > 0 && (
              <div className="balance-stat">
                <span className="bs-label">Salary</span>
                <span className="bs-val">
                  {salary.toLocaleString("en-LK", { minimumFractionDigits: 0 })}
                </span>
              </div>
            )}
            <div className="balance-stat">
              <span className="bs-label">Today</span>
              <span className="bs-val">
                {todayTotal.toLocaleString("en-LK", { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Budget bar on card */}
          {salary > 0 && (
            <div className="card-budget-bar">
              <div className="card-budget-bar-track">
                <div
                  className={`card-budget-bar-fill ${barClass}`}
                  style={{ width: `${spentPct}%` }}
                />
              </div>
              <div className="card-budget-pct">
                {isOverBudget
                  ? `⚠ ${spentPct.toFixed(0)}% — Over budget`
                  : `${spentPct.toFixed(0)}% of salary used`}
              </div>
            </div>
          )}

          {/* No salary CTA */}
          {salary === 0 && (
            <button
              id="btn-set-salary-card"
              type="button"
              className="no-salary-cta"
              onClick={openSalary}
            >
              <span>💼</span>
              <span className="no-salary-cta-text">Set your monthly salary to track budget</span>
              <span className="no-salary-cta-arrow">›</span>
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button type="button" className="qa-btn" id="qa-add" onClick={openAdd}>
            <div className="qa-icon">➕</div>
            <span className="qa-label">Add</span>
          </button>
          <button type="button" className="qa-btn" id="qa-salary" onClick={openSalary}>
            <div className="qa-icon">💼</div>
            <span className="qa-label">Salary</span>
          </button>
          <button type="button" className="qa-btn" id="qa-monthly"
            onClick={() => { setActiveNav("transactions"); setActiveTab("monthly"); }}>
            <div className="qa-icon">📅</div>
            <span className="qa-label">Monthly</span>
          </button>
          <button type="button" className="qa-btn" id="qa-today"
            onClick={() => { setActiveNav("transactions"); setActiveTab("daily"); }}>
            <div className="qa-icon">📊</div>
            <span className="qa-label">Today</span>
          </button>
        </div>

        {/* ── HOME VIEW ─────────────────────────────────────────── */}
        {activeNav === "home" && (
          <>
            {/* Recent Transactions */}
            <div className="section-header">
              <span className="section-title">Recent</span>
              <button
                type="button"
                className="section-link"
                onClick={() => setActiveNav("transactions")}
              >
                See all
              </button>
            </div>

            <div className="txn-list">
              {expenses.slice(0, 5).length === 0 ? (
                <div className="txn-empty">
                  <div className="txn-empty-icon">📭</div>
                  <span>No transactions yet</span>
                </div>
              ) : (
                expenses.slice(0, 5).map((e) => (
                  <TxnRow key={e.id} expense={e} onDelete={handleDelete} />
                ))
              )}
            </div>

            {/* Budget Overview */}
            {salary > 0 && (
              <>
                <div className="section-header" style={{ paddingTop: "28px" }}>
                  <span className="section-title">{monthName} Budget</span>
                  <button type="button" className="section-link" onClick={openSalary}>
                    Edit
                  </button>
                </div>

                <div className="budget-overview-card">
                  <div className="bov-salary">{fmtShort(salary)}</div>
                  <div className="bov-bar-track">
                    <div
                      className={`bov-bar-fill ${barClass}`}
                      style={{ width: `${spentPct}%` }}
                    />
                  </div>
                  <div className="bov-stats">
                    <div className="bov-stat">
                      <span className="bov-stat-label">Spent</span>
                      <span className="bov-stat-val white">{fmtShort(monthTotal)}</span>
                    </div>
                    <div className="bov-stat">
                      <span className="bov-stat-label">Used</span>
                      <span className={`bov-stat-val ${barClass === "safe" ? "green" : barClass === "warn" ? "orange" : "red"}`}>
                        {spentPct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="bov-stat">
                      <span className="bov-stat-label">{isOverBudget ? "Over by" : "Left"}</span>
                      <span className={`bov-stat-val ${isOverBudget ? "red" : "green"}`}>
                        {fmtShort(Math.abs(remaining!))}
                      </span>
                    </div>
                  </div>
                  {isOverBudget && (
                    <div className="bov-over-pill">⚠ You've exceeded your budget this month</div>
                  )}
                </div>
              </>
            )}

            <div style={{ height: 24 }} />
          </>
        )}

        {/* ── TRANSACTIONS VIEW ─────────────────────────────────── */}
        {activeNav === "transactions" && (
          <>
            <div className="section-header">
              <span className="section-title">Transactions</span>
            </div>

            {/* Tab Pills */}
            <div className="tab-pills">
              <button
                type="button"
                id="tab-daily"
                className={`tab-pill ${activeTab === "daily" ? "active" : ""}`}
                onClick={() => setActiveTab("daily")}
              >
                Today
              </button>
              <button
                type="button"
                id="tab-monthly"
                className={`tab-pill ${activeTab === "monthly" ? "active" : ""}`}
                onClick={() => setActiveTab("monthly")}
              >
                This Month
              </button>
            </div>

            {/* Summary pill */}
            <div className="month-pill">
              <span className="mp-label">
                {activeTab === "daily" ? "Today's total" : `${monthName} total`}
              </span>
              <span className="mp-value">
                {fmtShort(activeTab === "daily" ? todayTotal : monthTotal)}
              </span>
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
          </>
        )}
      </div>

      {/* ── Bottom Nav ─────────────────────────────────────────── */}
      <nav className="bottom-nav">
        <button
          type="button"
          id="nav-home"
          className={`nav-item ${activeNav === "home" ? "active" : ""}`}
          onClick={() => setActiveNav("home")}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>

        <div className="nav-spacer" />

        <button
          type="button"
          id="nav-txn"
          className={`nav-item ${activeNav === "transactions" ? "active" : ""}`}
          onClick={() => setActiveNav("transactions")}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Transactions</span>
        </button>
      </nav>

      {/* ── FAB ────────────────────────────────────────────────── */}
      <button
        type="button"
        id="fab-add"
        className={`fab ${sheet === "add" ? "open" : ""}`}
        onClick={() => (sheet === "add" ? setSheet("none") : openAdd())}
        aria-label="Add expense"
      >
        <span className="fab-icon">+</span>
      </button>

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
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatDate(iso: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (iso === today) return "Today";
  if (iso === yesterday) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default App;
