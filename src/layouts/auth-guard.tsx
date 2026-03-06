import { Outlet, useNavigate } from "react-router";
import { LoadingScreen } from "../components/loading-screen";
import { useCurrentUser } from "../lib/hooks";

// Protect routes requiring authentication
export function AuthGuard() {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useCurrentUser();

  // Show loading while fetching user
  if (isLoading) return <LoadingScreen />;
  // Redirect to login on error
  if (isError) navigate("/login");
  // Redirect if no user found
  if (!user) navigate("/login");

  return <Outlet context={user} />;
}
