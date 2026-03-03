import { ArrowLeftRight, Briefcase, LayoutDashboard, Settings, User as UserIcon } from "lucide-react";
import { Link, useLocation, useOutletContext } from "react-router";
import type { User } from "../types";
import { Logo } from "./logo";
import { SidebarLogoutButton } from "./sidebar-logout-button";

export function Sidebar() {
  const location = useLocation();
  const user = useOutletContext<User>();

  const userNavItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Trade", path: "/trade", icon: <ArrowLeftRight size={20} /> },
    { name: "Portfolio", path: "/portfolio", icon: <Briefcase size={20} /> },
  ];

  const adminNavItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Clients", path: "/clients", icon: <UserIcon size={20} /> },
    { name: "Cryptos", path: "/cryptos", icon: <Briefcase size={20} /> },
  ]

  const navItems = user.roles.includes("ROLE_ADMIN") ? adminNavItems: userNavItems

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
  );
}
