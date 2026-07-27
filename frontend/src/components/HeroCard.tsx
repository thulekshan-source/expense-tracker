import React from "react";
import { formatCurrency } from "../utils";

interface HeroCardProps {
  monthTotal: number;
  todayTotal: number;
  avgPerDay: number;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  monthTotal,
  todayTotal,
  avgPerDay,
}) => {
  const { main, decimals } = formatCurrency(monthTotal);
  const todayFormatted = formatCurrency(todayTotal).full;
  const avgFormatted = formatCurrency(avgPerDay).full;

  return (
    <div className="bg-[#14171C] border border-[#262B33] rounded-[20px] p-6 shadow-xl mb-4 relative overflow-hidden">
      <span className="text-xs uppercase tracking-wider text-[#9096A1] font-semibold block mb-2">
        Spent this month
      </span>

      <div className="flex items-baseline mb-5">
        <span className="font-serif-italic text-4xl sm:text-5xl text-[#F3F4F6] font-normal leading-none">
          {main}
        </span>
        <span className="font-serif-italic text-2xl sm:text-3xl text-[#565C67] ml-0.5 font-normal">
          {decimals}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="bg-[#1B1F26] border border-[#262B33] rounded-full px-3 py-1.5 text-xs text-[#9096A1] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4C7DFF] inline-block"></span>
          <span>
            Today: <strong className="text-[#F3F4F6] font-medium">{todayFormatted}</strong>
          </span>
        </div>

        <div className="bg-[#1B1F26] border border-[#262B33] rounded-full px-3 py-1.5 text-xs text-[#9096A1] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F5C24C] inline-block"></span>
          <span>
            Avg/day: <strong className="text-[#F3F4F6] font-medium">{avgFormatted}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
