import type { Expense } from "./types";

export function formatCurrency(amount: number): {
  full: string;
  main: string;
  decimals: string;
} {
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const parts = formatted.split(".");
  return {
    full: `Rs. ${formatted}`,
    main: `Rs. ${parts[0]}`,
    decimals: `.${parts[1]}`,
  };
}

export function formatDateLabel(dateStr: string): string {
  const todayStr = new Date().toISOString().split("T")[0];
  if (dateStr === todayStr) {
    return "Today";
  }

  // Parse YYYY-MM-DD cleanly regardless of timezone
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: dateObj.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function formatMonthLabel(yearMonthStr: string): string {
  const [year, month] = yearMonthStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, 1);
  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export interface DayGroup {
  date: string;
  label: string;
  total: number;
  expenses: Expense[];
}

export function groupExpensesByDay(expenses: Expense[]): DayGroup[] {
  const map: Record<string, Expense[]> = {};

  for (const exp of expenses) {
    if (!map[exp.date]) {
      map[exp.date] = [];
    }
    map[exp.date].push(exp);
  }

  const sortedDates = Object.keys(map).sort((a, b) => b.localeCompare(a));

  return sortedDates.map((date) => {
    const groupExpenses = map[date];
    const total = groupExpenses.reduce((sum, item) => sum + item.amount, 0);
    return {
      date,
      label: formatDateLabel(date),
      total,
      expenses: groupExpenses,
    };
  });
}

export interface MonthGroup {
  monthKey: string;
  label: string;
  total: number;
  expenses: Expense[];
}

export function groupExpensesByMonth(expenses: Expense[]): MonthGroup[] {
  const map: Record<string, Expense[]> = {};

  for (const exp of expenses) {
    const monthKey = exp.date.substring(0, 7); // YYYY-MM
    if (!map[monthKey]) {
      map[monthKey] = [];
    }
    map[monthKey].push(exp);
  }

  const sortedMonths = Object.keys(map).sort((a, b) => b.localeCompare(a));

  return sortedMonths.map((monthKey) => {
    const groupExpenses = map[monthKey];
    const total = groupExpenses.reduce((sum, item) => sum + item.amount, 0);
    return {
      monthKey,
      label: formatMonthLabel(monthKey),
      total,
      expenses: groupExpenses,
    };
  });
}
