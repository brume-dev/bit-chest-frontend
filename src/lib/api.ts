import type * as Types from "../types";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `API Error: ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export async function login(data: Types.LoginRequest) {
  const r = await fetcher<Types.AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r;
}

export async function register(data: Types.RegisterRequest) {
  // Register returns { message, user } — not a token
  const r = await fetcher<Types.RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r;
}

export async function getCurrentUser() {
  const r = await fetcher<Types.User>("/auth/me");
  return r;
}

export async function updateCurrentUser(data: Types.UpdateCurrentUserRequest) {
  // PATCH /auth/me returns User, not AuthResponse (no token)
  const r = await fetcher<Types.User>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return r;
}

export async function getTransactions() {
  const r = await fetcher<{ transactions: Types.Transaction[] }>("/transaction");
  return r.transactions;
}

export async function getTransaction(id: number) {
  const r = await fetcher<{ transaction: Types.Transaction }>(`/transaction/${id}`);
  return r.transaction;
}

export async function createTransaction(data: Types.CreateTransactionRequest) {
  const r = await fetcher<{ transaction: Types.Transaction }>("/transaction", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r.transaction;
}

export async function getCryptos() {
  // Backend returns a plain array, not { cryptos: [] }
  const r = await fetcher<Types.Crypto[]>("/crypto");
  return r;
}

export async function getCrypto(id: number) {
  // Backend returns a plain Crypto object, not { crypto: ... }
  const r = await fetcher<Types.Crypto>(`/crypto/${id}`);
  return r;
}

export async function getUsers() {
  const r = await fetcher<Types.User[]>("/user");
  return r;
}

export async function getUser(id: number) {
  // Backend returns plain User object, not { user: ... }
  const r = await fetcher<Types.User>(`/user/${id}`);
  return r;
}

export async function createUser(data: Types.CreateUserRequest) {
  const r = await fetcher<{ user: Types.User }>("/user", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r.user;
}

export async function updateUser(id: number, data: Types.UpdateUserRequest) {
  // Backend returns plain User object, not { user: ... }
  const r = await fetcher<Types.User>(`/user/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return r;
}

export async function deleteUser(id: number) {
  // Backend returns plain User object, not { user: ... }
  const r = await fetcher<Types.User>(`/user/${id}`, {
    method: "DELETE",
  });
  return r;
}
