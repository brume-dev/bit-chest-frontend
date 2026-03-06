import { Outlet, useOutletContext } from "react-router";
import { Sidebar } from "../components/sidebar";
import type { User } from "../lib/types";

// Layout wrapper with sidebar for authenticated routes
export function SidebarLayout() {
  const user = useOutletContext<User>();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        {/* Pass user context to child routes */}
        <Outlet context={user} />
      </main>
    </div>
  );
}
