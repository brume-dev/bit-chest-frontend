export interface User {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	roles: string[];
	balance: string; // DECIMAL comes back as string from PHP/JSON
	createdAt: string;
}

export interface Transaction {
	id: number;
	type: "buy" | "sell";
	amount: string; // DECIMAL comes back as string
	date: string; // was createdAt — backend sends "date"
	crypto: {
		id: number;
		name: string;
		abbreviation: string; // was "symbol" — backend sends "abbreviation"
	};
	price: {
		id: number;
		value: string; // DECIMAL
		date: string;
	};
}

export interface Crypto {
	id: number;
	name: string;
	abbreviation: string; // was "symbol"
	prices: Price[]; // backend serializes the full prices collection
}

export interface Price {
	id: number;
	value: string; // DECIMAL
	date: string;
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

export interface UpdateCurrentUserRequest {
	firstName?: string; // was all required — PATCH, so all optional
	lastName?: string;
	phoneNumber?: string;
}

export interface AuthResponse {
	// Login is handled by the JWT firewall and returns a token directly.
	// Register and /auth/me return user data but NO token.
	// These are two different shapes — split them:
	token: string;
}

export interface RegisterResponse {
	message: string;
	user: {
		id: number;
		email: string;
		firstName: string;
		lastName: string;
		phoneNumber: string;
		balance: string;
	};
}

export interface CreateTransactionRequest {
	cryptoId: number;
	priceId: number;
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

export interface PortfolioRow {
	crypto: Crypto;
	holdings: number;
	valueEur: number;
	change24h: number;
}
