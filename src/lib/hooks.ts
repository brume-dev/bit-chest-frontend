import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type * as Types from "../types";
import * as Api from "./api";

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

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: Api.getCurrentUser,
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Types.UpdateCurrentUserRequest) => Api.updateCurrentUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

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

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: Api.getTransactions,
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => Api.getTransaction(id),
    enabled: !!id,
  });
}

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

export function useCryptos() {
  return useQuery({
    queryKey: ["cryptos"],
    queryFn: Api.getCryptos,
  });
}

export function useCrypto(id: number) {
  return useQuery({
    queryKey: ["cryptos", id],
    queryFn: () => Api.getCrypto(id),
    enabled: !!id,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: Api.getUsers,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => Api.getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: Api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

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

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: Api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
