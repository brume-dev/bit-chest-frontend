import { ArrowLeftRightIcon, BriefcaseIcon, LayoutDashboardIcon, UserIcon } from "lucide-react";
import { Link, useLocation, useOutletContext } from "react-router";
import type { User } from "../lib/types";
import { Logo } from "./logo";
import { SidebarLogoutButton } from "./sidebar-logout-button";

export function Sidebar() {
  const location = useLocation();
  const user = useOutletContext<User>();

  const userNavItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboardIcon size={20} /> },
    { name: "Trade", path: "/trade", icon: <ArrowLeftRightIcon size={20} /> },
    { name: "Portfolio", path: "/portfolio", icon: <BriefcaseIcon size={20} /> },
  ];

  const adminNavItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: <LayoutDashboardIcon size={20} /> },
    { name: "Clients", path: "/clients", icon: <UserIcon size={20} /> },
    { name: "Cryptos", path: "/cryptos", icon: <BriefcaseIcon size={20} /> },
  ];

  const navItems = user.roles.includes("ROLE_ADMIN") ? adminNavItems : userNavItems;

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col h-screen w-64 bg-base-100 border-r border-neutral/20 sticky top-0">
        <Logo />

        <nav className="flex-1 px-4">
          <ul className="menu menu-md w-full gap-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 py-3 ${location.pathname === item.path ? "active" : ""}`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral/20">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-3 flex-1 min-w-0 p-2 rounded-xl hover:bg-base-200 transition-colors group"
            >
              <div className="avatar avatar-placeholder shrink-0">
                <div className="bg-primary text-primary-content rounded-full w-9 text-xs font-bold">
                  <span>
                    {user.firstName[0].toUpperCase()}
                    {user.lastName[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-neutral truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-neutral/40 truncate leading-tight group-hover:text-neutral/60 transition-colors">
                  View profile
                </p>
              </div>
            </Link>
            <SidebarLogoutButton />
          </div>
        </div>
      </div>

      {/* ── Mobile bottom bar ───────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-neutral/20">
        <nav className="flex items-center justify-around px-2 h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  isActive ? "text-secondary" : "text-neutral/40 hover:text-neutral/60"
                }`}
              >
                <span className={`transition-transform duration-150 ${isActive ? "scale-110" : "scale-100"}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-semibold leading-none ${isActive ? "text-secondary" : ""}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              location.pathname === "/profile" ? "text-secondary" : "text-neutral/40 hover:text-neutral/60"
            }`}
          >
            <div className="avatar avatar-placeholder">
              <div
                className={`rounded-full w-6 text-[9px] font-bold transition-colors ${
                  location.pathname === "/profile" ? "bg-secondary text-white" : "bg-primary text-primary-content"
                }`}
              >
                <span>
                  {user.firstName[0].toUpperCase()}
                  {user.lastName[0].toUpperCase()}
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] font-semibold leading-none ${
                location.pathname === "/profile" ? "text-secondary" : ""
              }`}
            >
              Profile
            </span>
          </Link>
        </nav>
      </div>
    </>
  );
}
