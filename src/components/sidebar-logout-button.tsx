import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { useLogout } from "../lib/hooks";

export function SidebarLogoutButton() {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
      title="Logout"
      disabled={logoutMutation.isPending}
      type="button"
    >
      {logoutMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : <LogOut size={18} />}
    </button>
  );
}
