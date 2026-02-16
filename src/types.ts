export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "user" | "admin";
}

export interface Transaction {
  id: string;
  cryptoId: string;
  priceId: string;
  amount: number;
  type: "buy" | "sell";
  createdAt: string;
  userId: string;
}

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateTransactionRequest {
  cryptoId: string;
  priceId: string;
  amount: number;
  type: "buy" | "sell";
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: "user" | "admin";
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  role?: "user" | "admin";
}
