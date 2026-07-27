import { useState, useMemo } from "react";
import type { Expense, Category } from "./types";
import { Header } from "./components/Header";
import { HeroCard } from "./components/HeroCard";
import { StatRow } from "./components/StatRow";
import { EntryForm } from "./components/EntryForm";
import { TabControl } from "./components/TabControl";
import type { ViewTab } from "./components/TabControl";
import { TransactionList } from "./components/TransactionList";
import { Footer } from "./components/Footer";

const getTodayISO = () => new Date().toISOString().split("T")[0];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    date: getTodayISO(),
    category: "Food",
    amount: 1450,
    note: "Lunch at Bistro",
  },
  {
    id: "exp-2",
    date: getTodayISO(),
    category: "Transport",
    amount: 350,
    note: "Uber ride to office",
  },
  {
    id: "exp-3",
    date: "2026-07-25",
    category: "Utilities",
    amount: 4200,
    note: "Electricity & Internet",
  },
  {
    id: "exp-4",
    date: "2026-07-20",
    category: "Rent",
    amount: 15000,
    note: "July Apartment Rent",
  },
  {
    id: "exp-5",
    date: "2026-07-15",
    category: "Health",
    amount: 1850,
    note: "Pharmacy & Checkup",
  },
  {
    id: "exp-6",
    date: "2026-07-10",
    category: "Other",
    amount: 920,
    note: "Books & Stationery",
  },
];

export function App() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [activeTab, setActiveTab] = useState<ViewTab>("daily");

  const addExpense = (newExp: {
    category: Category;
    amount: number;
    date: string;
    note?: string;
  }) => {
    const expenseItem: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...newExp,
    };
    setExpenses((prev) => [expenseItem, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Reactive metrics calculations
  const { monthTotal, todayTotal, avgPerDay, todayCount, totalCount } =
    useMemo(() => {
      const todayStr = getTodayISO();
      const currentMonthStr = todayStr.substring(0, 7);
      const currentDayOfMonth = new Date().getDate();

      let mTotal = 0;
      let tTotal = 0;
      let tCount = 0;

      for (const exp of expenses) {
        if (exp.date === todayStr) {
          tTotal += exp.amount;
          tCount += 1;
        }
        if (exp.date.startsWith(currentMonthStr)) {
          mTotal += exp.amount;
        }
      }

      const avg = currentDayOfMonth > 0 ? mTotal / currentDayOfMonth : 0;

      return {
        monthTotal: mTotal,
        todayTotal: tTotal,
        avgPerDay: avg,
        todayCount: tCount,
        totalCount: expenses.length,
      };
    }, [expenses]);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F4F6] selection:bg-[#4C7DFF] selection:text-white font-inter">
      {/* Centered layout container max-width 480px */}
      <div className="max-w-[480px] mx-auto px-4 py-4 sm:py-6 flex flex-col min-h-screen">
        {/* 1. Header */}
        <Header />

        {/* 2. Hero Card */}
        <HeroCard
          monthTotal={monthTotal}
          todayTotal={todayTotal}
          avgPerDay={avgPerDay}
        />

        {/* 3. Stat Row */}
        <StatRow todayCount={todayCount} totalCount={totalCount} />

        {/* 4. New Entry Form Card */}
        <EntryForm onAddExpense={addExpense} />

        {/* 5. Segmented Pill Tab Control */}
        <TabControl activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 6. Transaction List */}
        <div className="flex-1">
          <TransactionList
            expenses={expenses}
            activeTab={activeTab}
            onDeleteExpense={deleteExpense}
          />
        </div>

        {/* 7. Footer */}
        <Footer entryCount={totalCount} />
      </div>
    </div>
  );
}

export default App;
