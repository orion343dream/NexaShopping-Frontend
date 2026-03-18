"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";
import { getSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import Link from "next/link";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "All Users",
  "/items": "Items",
  "/orders": "Orders",
  "/my-orders": "My Orders",
  "/profile": "My Profile",
};

function getTitle(pathname: string) {
  for (const [key, val] of Object.entries(titles)) {
    if (pathname === key || pathname.startsWith(key + "/")) return val;
  }
  return "NexaShopping";
}

const roleColors: Record<string, string> = {
  admin: "bg-amber-100 text-amber-700",
  user: "bg-violet-100 text-violet-700",
  manager: "bg-violet-100 text-violet-700",
  cashier: "bg-emerald-100 text-emerald-700",
};

export function Header() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const { toggle } = useSidebar();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/90 backdrop-blur-sm px-4 shadow-sm sm:px-6"
      style={{ borderBottomColor: "rgba(124,58,237,0.1)" }}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile brand icon */}
        <div className="lg:hidden flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#f59e0b,#7c3aed)" }}
          >
            <ShoppingCart className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>

      {/* Right – user chip */}
      {user && (
        <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow"
            style={{ background: "linear-gradient(135deg,#f59e0b,#7c3aed)" }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user.name}</p>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block ${roleColors[user.role] ?? "bg-slate-100 text-slate-600"}`}
            >
              {user.role}
            </span>
          </div>
        </Link>
      )}
    </header>
  );
}
