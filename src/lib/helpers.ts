import type { User } from "../types";

export function getPrimaryRole(user: User): "user" | "admin" {
  return user.roles.includes("ROLE_ADMIN") ? "admin" : "user";
}

export function getInitials(user: User) {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}
