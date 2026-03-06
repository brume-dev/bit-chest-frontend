import { Navigate, Outlet } from "react-router";
import { LoadingScreen } from "../components/loading-screen";
import { useCurrentUser } from "../lib/hooks";

export function AdminGuard() {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (isError) return <Navigate to="/login" />;
  if (!user) return <Navigate to="/login" />;
  if (!user?.roles.includes("ROLE_ADMIN")) return <Navigate to="/" />;

  return <Outlet context={user} />;
}
