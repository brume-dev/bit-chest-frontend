import { ArrowLeftRight, Briefcase, LayoutDashboard, Settings } from "lucide-react";
import { Link, useLocation, useOutletContext } from "react-router";
import type { User } from "../types";
import { Logo } from "./logo";
import { SidebarLogoutButton } from "./sidebar-logout-button";

export function Sidebar() {
  const location = useLocation();
  const user: User = useOutletContext();

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Trade", path: "/trade", icon: <ArrowLeftRight size={20} /> },
    { name: "Portfolio", path: "/portfolio", icon: <Briefcase size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-base-100 border-r border-neutral/20">
      {/* Logo Section */}
      <Logo />

      {/* Navigation Links */}
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

      {/* User Profile & Logout area */}
      <div className="p-4 border-t border-neutral/20 bg-neutral/5">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-base-100 rounded-full w-8 text-xs">
                <span>
                  {user.firstName[0].toUpperCase()}
                  {user.lastName[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-sm truncate w-24">
              <p className="font-bold truncate text-neutral">{user.firstName}</p>
              <p className="text-neutral/50 text-xs truncate">{user.role || "User"}</p>
            </div>
          </div>
          <SidebarLogoutButton />
        </div>
      </div>
    </div>
  );
}
