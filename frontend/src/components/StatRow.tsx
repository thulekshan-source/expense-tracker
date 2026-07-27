import React from "react";

interface StatRowProps {
  todayCount: number;
  totalCount: number;
}

export const StatRow: React.FC<StatRowProps> = ({ todayCount, totalCount }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-[#14171C] border border-[#262B33] rounded-[20px] p-4 flex flex-col justify-between">
        <span className="text-xs text-[#9096A1] font-medium">Entries today</span>
        <span className="text-2xl font-bold text-[#F3F4F6] mt-1">
          {todayCount}
        </span>
      </div>

      <div className="bg-[#14171C] border border-[#262B33] rounded-[20px] p-4 flex flex-col justify-between">
        <span className="text-xs text-[#9096A1] font-medium">Total entries</span>
        <span className="text-2xl font-bold text-[#F3F4F6] mt-1">
          {totalCount}
        </span>
      </div>
    </div>
  );
};
