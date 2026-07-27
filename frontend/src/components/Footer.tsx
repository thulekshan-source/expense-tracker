import React from "react";

interface FooterProps {
  entryCount: number;
}

export const Footer: React.FC<FooterProps> = ({ entryCount }) => {
  return (
    <footer className="text-center text-xs text-[#565C67] pt-4 pb-8 font-medium border-t border-[#262B33]/50 mt-6">
      All data stored locally · {entryCount} {entryCount === 1 ? "entry" : "entries"}
    </footer>
  );
};
