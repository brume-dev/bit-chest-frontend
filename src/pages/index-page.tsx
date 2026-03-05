import { Navigate } from "react-router";
import { LoadingScreen } from "../components/loading-screen";
import { useCurrentUser } from "../lib/hooks";

export function IndexPage() {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (isError) return <Navigate to="/login" />;
  if (!user) return <Navigate to="/login" />;

  if (user.roles.includes("ROLE_ADMIN")) return <Navigate to="/admin-dashboard" />;
  return <Navigate to="/portfolio" />;
}
