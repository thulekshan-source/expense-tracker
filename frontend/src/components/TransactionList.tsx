import React from "react";
import { CATEGORY_COLORS } from "../types";
import type { Expense } from "../types";
import {
  groupExpensesByDay,
  groupExpensesByMonth,
  formatCurrency,
} from "../utils";
import type { ViewTab } from "./TabControl";

interface TransactionListProps {
  expenses: Expense[];
  activeTab: ViewTab;
  onDeleteExpense: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  expenses,
  activeTab,
  onDeleteExpense,
}) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-[#14171C] border border-[#262B33] rounded-[20px] p-8 text-center my-4">
        <p className="text-[#9096A1] text-sm font-medium">No expenses logged yet.</p>
        <p className="text-[#565C67] text-xs mt-1">
          Add an expense above to get started.
        </p>
      </div>
    );
  }

  if (activeTab === "daily") {
    const dayGroups = groupExpensesByDay(expenses);

    return (
      <div className="flex flex-col gap-5 mb-6">
        {dayGroups.map((group) => (
          <div key={group.date} className="flex flex-col gap-2.5">
            {/* Group header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9096A1]">
                {group.label}
              </span>
              <span className="text-xs font-medium text-[#565C67]">
                {formatCurrency(group.total).full}
              </span>
            </div>

            {/* List of transaction cards */}
            <div className="flex flex-col gap-2">
              {group.expenses.map((expense) => (
                <TransactionCard
                  key={expense.id}
                  expense={expense}
                  onDelete={onDeleteExpense}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Monthly tab
  const monthGroups = groupExpensesByMonth(expenses);

  return (
    <div className="flex flex-col gap-5 mb-6">
      {monthGroups.map((group) => (
        <div key={group.monthKey} className="flex flex-col gap-2.5">
          {/* Group header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9096A1]">
              {group.label}
            </span>
            <span className="text-xs font-medium text-[#565C67]">
              {formatCurrency(group.total).full}
            </span>
          </div>

          {/* List of transaction cards for this month */}
          <div className="flex flex-col gap-2">
            {group.expenses.map((expense) => (
              <TransactionCard
                key={expense.id}
                expense={expense}
                onDelete={onDeleteExpense}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface TransactionCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  expense,
  onDelete,
}) => {
  const catColor = CATEGORY_COLORS[expense.category] || "#9096A1";
  const initial = expense.category.charAt(0);
  const formattedAmount = formatCurrency(expense.amount).full;

  return (
    <div className="bg-[#14171C] border border-[#262B33] rounded-[20px] p-3.5 flex items-center gap-3 relative overflow-hidden transition-all hover:border-[#333944] group">
      {/* Thin colored accent bar on left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[20px]"
        style={{ backgroundColor: catColor }}
      />

      {/* Small colored icon circle with category initial */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ml-1.5 shadow-inner"
        style={{
          backgroundColor: `${catColor}20`,
          color: catColor,
          border: `1px solid ${catColor}40`,
        }}
      >
        {initial}
      </div>

      {/* Category name & optional note */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold text-[#F3F4F6] truncate">
          {expense.category}
        </span>
        {expense.note ? (
          <span className="text-xs text-[#9096A1] truncate">{expense.note}</span>
        ) : (
          <span className="text-[11px] text-[#565C67]">{expense.date}</span>
        )}
      </div>

      {/* Amount right-aligned in coral */}
      <span className="text-sm font-bold text-[#FF7A68] whitespace-nowrap ml-auto">
        {formattedAmount}
      </span>

      {/* Subtle delete "✕" button */}
      <button
        type="button"
        onClick={() => onDelete(expense.id)}
        title="Delete entry"
        aria-label="Delete entry"
        className="w-7 h-7 rounded-full flex items-center justify-center text-[#565C67] hover:text-[#FF7A68] hover:bg-[#FF7A68]/10 transition-all cursor-pointer flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
};
