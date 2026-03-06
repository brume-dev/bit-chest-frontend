import { Navigate } from "react-router";
import { LoadingScreen } from "../components/loading-screen";
import { useCurrentUser } from "../lib/hooks";

// Redirect to appropriate dashboard based on user role
export function IndexPage() {
  const { data: user, isLoading, isError } = useCurrentUser();

  // Show loading screen while fetching user
  if (isLoading) return <LoadingScreen />;
  // Redirect on auth error
  if (isError) return <Navigate to="/login" />;
  // Redirect if no user found
  if (!user) return <Navigate to="/login" />;

  // Route admin to admin dashboard, others to portfolio
  if (user.roles.includes("ROLE_ADMIN")) return <Navigate to="/admin-dashboard" />;
  return <Navigate to="/portfolio" />;
}
