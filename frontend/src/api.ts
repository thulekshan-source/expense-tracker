import type { Expense } from "./types";

const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchExpenses(): Promise<Expense[]> {
  return request<Expense[]>(`${BASE}/expenses`);
}

export async function createExpense(expense: Omit<Expense, "id">): Promise<Expense> {
  return request<Expense>(`${BASE}/expenses`, {
    method: "POST",
    body: JSON.stringify(expense),
  });
}

export async function deleteExpense(id: string): Promise<{ success: boolean; id: string }> {
  return request<{ success: boolean; id: string }>(`${BASE}/expenses/${id}`, {
    method: "DELETE",
  });
}

export async function importExpenses(expenses: Expense[]): Promise<Expense[]> {
  return request<Expense[]>(`${BASE}/expenses/import`, {
    method: "POST",
    body: JSON.stringify(expenses),
  });
}