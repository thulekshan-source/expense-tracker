import React from "react";

export const Header: React.FC = () => {
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <header className="flex items-center justify-between mb-6 pt-2">
      <div className="flex items-baseline gap-2">
        <h1 className="font-serif-italic text-3xl sm:text-4xl text-[#F3F4F6] tracking-tight">
          Ledger
        </h1>
      </div>
      <div className="bg-[#1B1F26] text-[#9096A1] text-xs px-3.5 py-1.5 rounded-full border border-[#262B33] font-medium shadow-sm">
        {todayFormatted}
      </div>
    </header>
  );
};
