import React from "react";

export type ViewTab = "daily" | "monthly";

interface TabControlProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const TabControl: React.FC<TabControlProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-[#14171C] p-1 border border-[#262B33] rounded-full flex gap-1 mb-4">
      <button
        type="button"
        onClick={() => onTabChange("daily")}
        className={`flex-1 py-2 text-center text-xs font-semibold rounded-full transition-all cursor-pointer ${
          activeTab === "daily"
            ? "bg-[#4C7DFF] text-white shadow-sm"
            : "text-[#9096A1] hover:text-[#F3F4F6]"
        }`}
      >
        Daily
      </button>

      <button
        type="button"
        onClick={() => onTabChange("monthly")}
        className={`flex-1 py-2 text-center text-xs font-semibold rounded-full transition-all cursor-pointer ${
          activeTab === "monthly"
            ? "bg-[#4C7DFF] text-white shadow-sm"
            : "text-[#9096A1] hover:text-[#F3F4F6]"
        }`}
      >
        Monthly
      </button>
    </div>
  );
};
