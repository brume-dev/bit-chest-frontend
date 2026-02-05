import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type * as Type from "../types";
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
    onSuccess: (data) => {
      localStorage.setItem("authToken", data.token);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
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

export function useTransaction(id: string) {
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
    },
  });
}
export function useCryptos() {
  return useQuery({
    queryKey: ["cryptos"],
    queryFn: Api.getCryptos,
  });
}

export function useCrypto(id: string) {
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

export function useUser(id: string) {
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
    mutationFn: ({ id, data }: { id: string; data: Type.UpdateUserRequest }) => Api.updateUser(id, data),
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
