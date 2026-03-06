import type * as Types from "../lib/types";

// Make authenticated API request with error handling
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Include auth token if available
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  // Throw error for non-ok responses
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.error || `API Error: ${res.status}`,
    );
  }
  // Return empty object for 204 No Content
  if (res.status === 204) return {} as T;
  return res.json();
}

// Authenticate user and get JWT token
export async function login(data: Types.LoginRequest) {
  const r = await fetcher<Types.AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r;
}

// Register new user without returning token
export async function register(data: Types.RegisterRequest) {
  // Register returns { message, user } — not a token
  const r = await fetcher<Types.RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r;
}

// Fetch current authenticated user details
export async function getCurrentUser() {
  const r = await fetcher<Types.User>("/auth/me");
  return r;
}

// Update current user profile fields
export async function updateCurrentUser(data: Types.UpdateCurrentUserRequest) {
  // PATCH /auth/me returns User, not AuthResponse (no token)
  const r = await fetcher<Types.User>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return r;
}

// Fetch all transactions for current user
export async function getTransactions() {
  const r = await fetcher<{ transactions: Types.Transaction[] }>(
    "/transaction",
  );
  return r.transactions;
}

// Fetch single transaction details by ID
export async function getTransaction(id: number) {
  const r = await fetcher<{ transaction: Types.Transaction }>(
    `/transaction/${id}`,
  );
  return r.transaction;
}

// Create new buy or sell transaction
export async function createTransaction(data: Types.CreateTransactionRequest) {
  const r = await fetcher<{ transaction: Types.Transaction }>("/transaction", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r.transaction;
}

// Fetch all available cryptocurrencies
export async function getCryptos() {
  // Backend returns a plain array, not { cryptos: [] }
  const r = await fetcher<Types.Crypto[]>("/crypto");
  return r;
}

// Fetch single cryptocurrency with price history
export async function getCrypto(id: number) {
  // Backend returns a plain Crypto object, not { crypto: ... }
  const r = await fetcher<Types.Crypto>(`/crypto/${id}`);
  return r;
}

// Fetch all users (admin endpoint)
export async function getUsers() {
  const r = await fetcher<Types.User[]>("/user");
  return r;
}

// Fetch single user details by ID
export async function getUser(id: number) {
  // Backend returns plain User object, not { user: ... }
  const r = await fetcher<Types.User>(`/user/${id}`);
  return r;
}

// Create new user (admin endpoint)
export async function createUser(data: Types.CreateUserRequest) {
  const r = await fetcher<{ user: Types.User }>("/user", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r.user;
}

// Update user details (admin endpoint)
export async function updateUser(id: number, data: Types.UpdateUserRequest) {
  // Backend returns plain User object, not { user: ... }
  const r = await fetcher<Types.User>(`/user/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return r;
}

// Delete user by ID (admin endpoint)
export async function deleteUser(id: number) {
  // Backend returns plain User object, not { user: ... }
  const r = await fetcher<Types.User>(`/user/${id}`, {
    method: "DELETE",
  });
  return r;
}

// Change current user's password
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const r = await fetcher<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r;
}

// Fetch all transactions across all users
export async function getAllTransactions() {
  const r = await fetcher<{ transactions: Types.Transaction[] }>(
    "/transaction/all",
  );
  return r.transactions;
}
