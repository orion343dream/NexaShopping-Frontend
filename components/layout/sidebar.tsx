"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ShoppingBag, ClipboardList,
  UserCircle, LogOut, ShoppingCart, Home, PackageSearch,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { clearSession, getSession, isAdmin } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

// Admin navigation items
const adminNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "All Users", href: "/users", icon: Users },
  { label: "Items", href: "/items", icon: ShoppingBag },
  { label: "Orders", href: "/orders", icon: ClipboardList },
  { label: "My Profile", href: "/profile", icon: UserCircle },
];

// Regular user navigation items
const userNav = [
  { label: "Shop", href: "/", icon: Home },
  { label: "My Orders", href: "/my-orders", icon: PackageSearch },
  { label: "My Profile", href: "/profile", icon: UserCircle },
];

const roleColors: Record<string, string> = {
  admin: "bg-amber-500/20 text-amber-300",
  user: "bg-violet-500/20 text-violet-300",
  manager: "bg-emerald-500/20 text-emerald-300",
  cashier: "bg-blue-500/20 text-blue-300",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, close } = useSidebar();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => { setUser(getSession()); }, [pathname]);

  const handleSignOut = () => {
    clearSession();
    close();
    router.replace("/");
  };

  const nav = user?.role === "admin" ? adminNav : userNav;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={close} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "linear-gradient(160deg, #0f0d1a 0%, #1a1030 60%, #120c20 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #f59e0b, #7c3aed)" }}
          >
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-white tracking-tight">NexaShopping</p>
            <p className="text-xs text-slate-400">
              {user?.role === "admin" ? "Admin Panel" : "My Account"}
            </p>
          </div>
        </div>

        {/* User chip */}
        {user && (
          <div className="mx-3 mt-3 rounded-xl px-3 py-2.5 bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", roleColors[user.role] ?? "bg-slate-700 text-slate-300")}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active ? "text-white shadow-inner" : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
                style={active ? { background: "linear-gradient(90deg,rgba(245,158,11,.25),rgba(124,58,237,.25))" } : undefined}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-amber-400" : "")} />
                {label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-3 pb-5 border-t border-white/10 pt-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
          <p className="text-xs text-slate-600 mt-3 px-1">NexaShopping v1.0 · POS System</p>
        </div>
      </aside>
    </>
  );
}
