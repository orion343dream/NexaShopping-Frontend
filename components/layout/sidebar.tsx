"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ShoppingBag, ClipboardList,
  UserCircle, LogOut, ShoppingCart, Home, PackageSearch,
  Activity,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { clearSession, getSession, isAdmin } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

const adminNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "All Users",  href: "/users",     icon: Users           },
  { label: "Items",      href: "/items",     icon: ShoppingBag     },
  { label: "Orders",     href: "/orders",    icon: ClipboardList   },
  { label: "System Monitor", href: "/system-monitor", icon: Activity },
  { label: "My Profile", href: "/profile",   icon: UserCircle      },
];

const userNav = [
  { label: "Shop",       href: "/",          icon: Home            },
  { label: "My Orders",  href: "/my-orders", icon: PackageSearch   },
  { label: "My Profile", href: "/profile",   icon: UserCircle      },
];

const rolePillStyle: Record<string, { bg: string; text: string }> = {
  admin:   { bg: "rgba(99,102,241,0.20)",  text: "#A5B4FC" },
  user:    { bg: "rgba(99,102,241,0.15)",  text: "#C7D2FE" },
  manager: { bg: "rgba(52,211,153,0.15)",  text: "#6EE7B7" },
  cashier: { bg: "rgba(59,130,246,0.15)",  text: "#93C5FD" },
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
          className="lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "#0F1117",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ── Brand ────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "20px 20px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#6366F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
            }}
          >
            <ShoppingCart style={{ width: 18, height: 18, color: "#FFFFFF", strokeWidth: 1.5 }} />
          </div>
          <div style={{ lineHeight: 1 }}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              NexaShopping
            </p>
            <p style={{ fontSize: 11, color: "#4B5563", margin: "3px 0 0" }}>
              {user?.role === "admin" ? "Admin Panel" : "My Account"}
            </p>
          </div>
        </div>

        {/* ── User chip ────────────────────────────────────────────────── */}
        {user && (
          <div
            style={{
              margin: "12px 12px 4px",
              borderRadius: 10,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "#6366F1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#F9FAFB",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 3,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    padding: "2px 7px",
                    borderRadius: 999,
                    background: (rolePillStyle[user.role] ?? rolePillStyle.user).bg,
                    color: (rolePillStyle[user.role] ?? rolePillStyle.user).text,
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav
          style={{
            flex: 1,
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {nav.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? "#FFFFFF" : "#6B7280",
                  textDecoration: "none",
                  background: active ? "rgba(99,102,241,0.18)" : "none",
                  border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                  transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
                  position: "relative",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#D1D5DB";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "none";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#6B7280";
                  }
                }}
              >
                <Icon
                  style={{
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    strokeWidth: 1.5,
                    color: active ? "#818CF8" : "currentColor",
                  }}
                />
                {label}
                {active && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#6366F1",
                      flexShrink: 0,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Sign Out + version ────────────────────────────────────────── */}
        <div
          style={{
            padding: "12px 12px 20px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "#6B7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "background 0.18s ease, color 0.18s ease",
              textAlign: "left",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.10)";
              (e.currentTarget as HTMLButtonElement).style.color = "#F87171";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
              (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
            }}
          >
            <LogOut style={{ width: 15, height: 15, flexShrink: 0, strokeWidth: 1.5 }} />
            Sign Out
          </button>
          <p
            style={{
              fontSize: 11,
              color: "#374151",
              margin: "12px 0 0 12px",
            }}
          >
            NexaShopping v1.0 · POS System
          </p>
        </div>
      </aside>
    </>
  );
}