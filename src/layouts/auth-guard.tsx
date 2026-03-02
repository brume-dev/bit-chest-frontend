import { Outlet, useNavigate } from "react-router";
import { useCurrentUser } from "../lib/hooks";

export function AuthGuard() {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useCurrentUser();
  if (isLoading) return <div>loading...</div>;
  if (isError) navigate("/auth");
  if (!user) navigate("/auth");

  return <Outlet context={user} />;
}
