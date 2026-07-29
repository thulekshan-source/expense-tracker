import type { Expense } from "./types";

const BASE = "/api";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

/** Fetch expenses with retry — handles the race condition where Vite
 *  starts faster than the Express/MongoDB backend is ready. */
export async function fetchExpenses(): Promise<Expense[]> {
  const MAX_RETRIES = 6;
  const BASE_DELAY = 800; // ms
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await request<Expense[]>(`${BASE}/expenses`);
    } catch (err) {
      const isLast = attempt === MAX_RETRIES - 1;
      if (isLast) throw err;
      // Exponential backoff: 800ms, 1.6s, 3.2s …
      await sleep(BASE_DELAY * Math.pow(2, attempt));
    }
  }
  throw new Error("Failed to connect to server after multiple retries");
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