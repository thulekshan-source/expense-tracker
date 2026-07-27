import React, { useState } from "react";
import { CATEGORIES } from "../types";
import type { Category } from "../types";

interface EntryFormProps {
  onAddExpense: (expense: {
    category: Category;
    amount: number;
    date: string;
    note?: string;
  }) => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onAddExpense }) => {
  const getTodayISO = () => new Date().toISOString().split("T")[0];

  const [category, setCategory] = useState<Category>("Food");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(getTodayISO());
  const [note, setNote] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0.");
      return;
    }

    setErrorMsg("");
    onAddExpense({
      category,
      amount: numAmount,
      date,
      note: note.trim() ? note.trim() : undefined,
    });

    // Reset form fields except date
    setAmount("");
    setNote("");
  };

  const isAmountValid = !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  return (
    <div className="bg-[#14171C] border border-[#262B33] rounded-[20px] p-5 mb-4 shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Category Pill Chips */}
        <div>
          <label className="text-xs uppercase tracking-wider text-[#9096A1] font-semibold block mb-2.5">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#4C7DFF]/20 border-[#4C7DFF] text-[#F3F4F6] shadow-sm scale-[1.02]"
                      : "bg-[#1B1F26] border-[#262B33] text-[#9096A1] hover:text-[#F3F4F6] hover:border-[#3A404D]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-column row: Amount and Date */}
        <div className="grid grid-cols-2 gap-3">
          {/* Amount input with Rs prefix inside */}
          <div>
            <label className="text-xs uppercase tracking-wider text-[#9096A1] font-semibold block mb-1.5">
              Amount
            </label>
            <div className="relative flex items-center bg-[#1B1F26] border border-[#262B33] rounded-[12px] px-3 py-2.5 focus-within:border-[#4C7DFF] transition-colors">
              <span className="text-[#9096A1] font-bold text-sm select-none mr-1.5">
                Rs.
              </span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                className="bg-transparent border-none outline-none text-[#F3F4F6] font-bold text-base w-full placeholder:text-[#565C67]"
              />
            </div>
          </div>

          {/* Date input */}
          <div>
            <label className="text-xs uppercase tracking-wider text-[#9096A1] font-semibold block mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#1B1F26] border border-[#262B33] rounded-[12px] px-3 py-2.5 outline-none text-[#F3F4F6] text-sm w-full focus:border-[#4C7DFF] transition-colors font-medium"
            />
          </div>
        </div>

        {/* Note input (optional) */}
        <div>
          <label className="text-xs uppercase tracking-wider text-[#9096A1] font-semibold block mb-1.5">
            Note <span className="text-[#565C67] font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Lunch with friends"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-[#1B1F26] border border-[#262B33] rounded-[12px] px-3.5 py-2.5 outline-none text-[#F3F4F6] text-sm w-full focus:border-[#4C7DFF] transition-colors placeholder:text-[#565C67]"
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-[#FF7A68] font-medium mt-1">{errorMsg}</p>
        )}

        {/* Full width accent-colored Add expense button */}
        <button
          type="submit"
          disabled={!isAmountValid}
          className={`w-full py-3 px-4 rounded-[12px] font-semibold text-sm transition-all shadow-md cursor-pointer mt-1 ${
            isAmountValid
              ? "bg-[#4C7DFF] hover:bg-[#3B6CE8] active:scale-[0.99] text-white shadow-[#4C7DFF]/20"
              : "bg-[#1B1F26] text-[#565C67] border border-[#262B33] cursor-not-allowed"
          }`}
        >
          Add expense
        </button>
      </form>
    </div>
  );
};
