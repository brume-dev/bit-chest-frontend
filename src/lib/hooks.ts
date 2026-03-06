import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type * as Types from "../lib/types";
import * as Api from "./api";

// Authenticate user with email and password
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: Api.login,
    onSuccess: (data) => {
      localStorage.setItem("authToken", data.token);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

// Create new user account with registration data
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: Api.register,
    // Register doesn't return a token — user must log in after registering
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

// Fetch currently logged-in user profile
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: Api.getCurrentUser,
  });
}

// Update current user profile information
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Types.UpdateCurrentUserRequest) =>
      Api.updateCurrentUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

// Log out current user and clear state
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("authToken");
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Fetch all transactions for current user
export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: Api.getTransactions,
  });
}

// Fetch single transaction by ID
export function useTransaction(id: number) {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => Api.getTransaction(id),
    enabled: !!id,
  });
}

// Create new buy or sell transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: Api.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // Also invalidate auth/me since balance changes on transaction
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

// Fetch all cryptocurrencies with price histories
export function useCryptos() {
  return useQuery({
    queryKey: ["cryptos"],
    queryFn: Api.getCryptos,
  });
}

// Fetch single cryptocurrency with full price history
export function useCrypto(id: number) {
  return useQuery({
    queryKey: ["cryptos", id],
    queryFn: () => Api.getCrypto(id),
    enabled: !!id,
  });
}

// Fetch all users (admin only)
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: Api.getUsers,
  });
}

// Fetch single user by ID
export function useUser(id: number) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => Api.getUser(id),
    enabled: !!id,
  });
}

// Create new user account (admin only)
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: Api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Update existing user (admin only)
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Types.UpdateUserRequest }) =>
      Api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Delete user by ID (admin only)
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: Api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Change current user's password
export function useChangePassword() {
  return useMutation({
    mutationFn: Api.changePassword,
  });
}

// Fetch all transactions across all users
export function useAllTransactions() {
  return useQuery({
    queryKey: ["transactions", "all"],
    queryFn: Api.getAllTransactions,
  });
}
