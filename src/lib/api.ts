import type * as Types from "../types";

const API_URL = import.meta.env.API_URL;

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export async function login(data: Types.LoginRequest) {
  const r = await fetcher<Types.AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r;
}

export async function register(data: Types.RegisterRequest) {
  const r = await fetcher<Types.AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r;
}

export async function getTransactions() {
  return fetcher<{ transactions: Types.Transaction[] }>("/transaction").then((r) => r.transactions);
}

export async function getTransaction(id: string) {
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
  const r = await fetcher<{ cryptos: Crypto[] }>("/crypto");
  return r.cryptos;
}

export async function getCrypto(id: string) {
  const r = await fetcher<{ crypto: Crypto }>(`/crypto/${id}`);
  return r.crypto;
}

export async function getUsers() {
  const r = await fetcher<{ users: Types.User[] }>("/user");
  return r.users;
}

export async function getUser(id: string) {
  const r = await fetcher<{ user: Types.User }>(`/user/${id}`);
  return r.user;
}

export async function createUser(data: Types.CreateUserRequest) {
  const r = await fetcher<{ user: Types.User }>("/user", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r.user;
}

export async function updateUser(id: string, data: Types.UpdateUserRequest) {
  const r = await fetcher<{ user: Types.User }>(`/user/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return r.user;
}

export async function deleteUser(id: string) {
  const r = await fetcher<{ user: Types.User }>(`/user/${id}`, {
    method: "DELETE",
  });
  return r.user;
}
