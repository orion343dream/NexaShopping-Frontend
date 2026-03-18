"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, LogOut, UserCircle, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { getSession, clearSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/#shop" },
];

export function PublicNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setUser(getSession());
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleSignOut = () => {
    clearSession();
    setUser(null);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg,#f59e0b,#7c3aed)" }}
            >
              <ShoppingCart className="h-4.5 w-4.5 text-white h-5 w-5" />
            </div>
            <div className="leading-none">
              <span className="text-lg font-bold text-slate-900 tracking-tight">NexaShopping</span>
              <span className="hidden sm:block text-[10px] text-slate-500 -mt-0.5">Point of Sale</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-violet-700 rounded-lg hover:bg-violet-50 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/my-orders">
                  <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                    <ShoppingCart className="h-4 w-4" />
                    My Orders
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#7c3aed)" }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.name?.split(" ")[0]}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-600 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0 shadow-md hover:from-amber-600 hover:to-violet-700 font-semibold"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-2 shadow-lg">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-slate-100 pt-2 space-y-2">
              {user ? (
                <>
                  <Link href="/my-orders" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <ShoppingCart className="h-4 w-4" /> My Orders
                    </Button>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleSignOut} variant="ghost" size="sm" className="w-full justify-start gap-2 text-red-500">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-6 text-xs mt-auto">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-5 w-5 rounded bg-gradient-to-br from-amber-500 to-violet-600 flex items-center justify-center">
            <ShoppingCart className="h-3 w-3 text-white" />
          </div>
          <span className="font-semibold text-white">NexaShopping</span>
        </div>
        <p>© {new Date().getFullYear()} NexaShopping POS · All rights reserved</p>
      </footer>
    </div>
  );
}
