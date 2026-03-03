import { Outlet, useNavigate } from "react-router";
import { useCurrentUser } from "../lib/hooks";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-base-300" />
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-semibold text-base-content">Loading</span>
          <span className="text-sm text-base-content/50">Please wait a moment...</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function AuthGuard() {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (isError) navigate("/login");
  if (!user) navigate("/login");

  return <Outlet context={user} />;
}
