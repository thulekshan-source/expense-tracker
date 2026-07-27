export const CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Rent",
  "Health",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#FF7A68",
  Transport: "#4C7DFF",
  Utilities: "#F5C24C",
  Rent: "#B08CFF",
  Health: "#54D9A6",
  Other: "#9096A1",
};

export interface Expense {
  id: string;
  date: string; // ISO date string: "YYYY-MM-DD"
  category: Category;
  amount: number;
  note?: string;
}
