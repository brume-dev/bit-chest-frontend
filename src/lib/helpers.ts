import type { User } from "../types";

export function getPrimaryRole(user: User): "user" | "admin" {
  return user.roles.includes("ROLE_ADMIN") ? "admin" : "user";
}
