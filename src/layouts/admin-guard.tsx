import { Navigate, Outlet } from "react-router";
import { LoadingScreen } from "../components/loading-screen";
import { useCurrentUser } from "../lib/hooks";

// Protect admin routes requiring ROLE_ADMIN
export function AdminGuard() {
  const { data: user, isLoading, isError } = useCurrentUser();

  // Show loading while fetching user
  if (isLoading) return <LoadingScreen />;
  // Redirect on auth error
  if (isError) return <Navigate to="/login" />;
  // Redirect if no user
  if (!user) return <Navigate to="/login" />;
  // Redirect if not admin
  if (!user?.roles.includes("ROLE_ADMIN")) return <Navigate to="/" />;

  return <Outlet context={user} />;
}
