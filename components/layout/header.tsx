"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";
import { getSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import Link from "next/link";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users":     "All Users",
  "/items":     "Items",
  "/orders":    "Orders",
  "/my-orders": "My Orders",
  "/profile":   "My Profile",
};

function getTitle(pathname: string) {
  for (const [key, val] of Object.entries(titles)) {
    if (pathname === key || pathname.startsWith(key + "/")) return val;
  }
  return "NexaShopping";
}

const rolePillStyle: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  admin:   { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", dot: "#F59E0B" },
  user:    { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE", dot: "#6366F1" },
  manager: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE", dot: "#6366F1" },
  cashier: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", dot: "#22C55E" },
};

export function Header() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const { toggle } = useSidebar();
  const [user] = useState<SessionUser | null>(() => getSession());

  const rStyle = rolePillStyle[user?.role ?? ""] ?? { bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB", dot: "#9CA3AF" };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        height: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(249,250,251,0.96) 100%)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(229,231,235,0.5)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 0 1px rgba(99,102,241,0.1) inset",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── Left ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden"
          onClick={toggle}
          aria-label="Toggle menu"
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 10,
            cursor: "pointer",
            color: "#6366F1",
            transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(99,102,241,0.12)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.20)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(99,102,241,0.12)";
          }}
        >
          <Menu style={{ width: 18, height: 18, strokeWidth: 1.8 }} />
        </button>

        {/* Mobile brand mark */}
        <div
          className="lg:hidden"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.30), 0 0 1px rgba(255,255,255,0.5) inset",
            flexShrink: 0,
          }}
        >
          <ShoppingCart style={{ width: 15, height: 15, color: "#FFFFFF", strokeWidth: 1.8 }} />
        </div>

        {/* Page title */}
        <h1
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#111827",
            margin: 0,
            letterSpacing: "-0.015em",
            background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </h1>
      </div>

      {/* ── Right — user chip ─────────────────────────────────────────── */}
      {user && (
        <Link
          href="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px 8px 8px",
            borderRadius: 14,
            border: "1px solid rgba(99,102,241,0.15)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.95) 100%)",
            textDecoration: "none",
            transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 0 1px rgba(99,102,241,0.1) inset",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, rgba(249,250,251,0.95) 0%, rgba(243,244,246,0.98) 100%)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 16px rgba(99,102,241,0.15), 0 0 1px rgba(99,102,241,0.2) inset";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.95) 100%)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04), 0 0 1px rgba(99,102,241,0.1) inset";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "#FFFFFF",
              flexShrink: 0,
              boxShadow: "0 3px 10px rgba(99,102,241,0.25), 0 0 1px rgba(255,255,255,0.4) inset",
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>

          {/* Name + role */}
          <div
            className="hidden sm:block"
            style={{ textAlign: "right" }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {user.name}
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                marginTop: 4,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.05em",
                padding: "3px 8px",
                borderRadius: 999,
                background: rStyle.bg,
                color: rStyle.text,
                border: `1.5px solid ${rStyle.border}`,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: rStyle.dot,
                  flexShrink: 0,
                  boxShadow: `0 0 4px ${rStyle.dot}`,
                }}
              />
              {user.role}
            </span>
          </div>
        </Link>
      )}
    </header>
  );
}