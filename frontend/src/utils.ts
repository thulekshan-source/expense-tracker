import type { Expense } from "./types";

export function fmt(n: number): string {
  return (
    "Rs. " +
    Number(n).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatHeaderDate(): string {
  return new Date()
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();
}

export function getFilteredExpenses(
  expenses: Expense[],
  activeTab: "daily" | "monthly"
): Expense[] {
  const today = todayISO();
  const currentMonth = today.slice(0, 7);

  if (activeTab === "daily") {
    return expenses.filter((e) => e.date === today);
  }
  return expenses.filter((e) => e.date.slice(0, 7) === currentMonth);
}
