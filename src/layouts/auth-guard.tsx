import { Outlet, useNavigate } from "react-router";
import { LoadingScreen } from "../components/loading-screen";
import { useCurrentUser } from "../lib/hooks";

export function AuthGuard() {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (isError) navigate("/login");
  if (!user) navigate("/login");

  return <Outlet context={user} />;
}
