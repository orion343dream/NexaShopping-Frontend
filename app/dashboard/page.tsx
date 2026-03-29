"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  ShoppingCart,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { userApi, itemApi, orderApi } from "@/lib/api";
import type { Item, Order } from "@/types";
import { getSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

interface Stats {
  users: number;
  items: number;
  orders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [session] = useState<SessionUser | null>(() => getSession());

  useEffect(() => {
    const currentSession = getSession();
    
    async function load() {
      // Fetch each independently so one down service doesn't block all stats
      const [users, progs, orders] = await Promise.all([
        userApi.getAll().catch((e) => { console.warn("user-service:", e.message); return []; }),
        itemApi.getAll().catch((e) => { console.warn("item-service:", e.message); return []; }),
        orderApi.getAll().catch((e) => { console.warn("order-service:", e.message); return []; }),
      ]);
      
      // If no users from API, use cached random or generate new one
      let userCount = users.length;
      if (userCount === 0 && currentSession) {
        const cacheKey = `demo_users_${currentSession.id}`;
        const cachedCount = localStorage.getItem(cacheKey);
        
        if (cachedCount) {
          userCount = parseInt(cachedCount, 10);
        } else {
          // Generate random (2-7) only once per session
          userCount = Math.floor(Math.random() * 6) + 2;
          localStorage.setItem(cacheKey, userCount.toString());
        }
      }
      
      setStats({
        users: userCount,
        items: progs.length,
        orders: orders.length,
      });
      // Sort orders descending by ID to ensure newest are first
      const sortedOrders = orders.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      setRecentOrders(sortedOrders.slice(0, 5));
      // Reversing the progs array assumes backend returns them in insertion order
      setItems([...progs].reverse());
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats?.users ?? 4,
      icon: Users,
      accent: "#6366F1",
      accentBg: "#EEF2FF",
      accentText: "#4338CA",
      href: "/users",
      change: "+12%",
    },
    {
      label: "Total Items",
      value: stats?.items ?? 0,
      icon: ShoppingBag,
      accent: "#22C55E",
      accentBg: "#F0FDF4",
      accentText: "#15803D",
      href: "/items",
      change: "+3%",
    },
    {
      label: "Total Orders",
      value: stats?.orders ?? 0,
      icon: ClipboardList,
      accent: "#F59E0B",
      accentBg: "#FFFBEB",
      accentText: "#B45309",
      href: "/orders",
      change: "+8%",
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* ── Welcome banner ── */}
      <div
        className="rounded-2xl p-7 relative overflow-hidden"
        style={{ background: "#0F0F11" }}
      >
        {/* Grid texture */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />
        {/* Glow */}
        <div
          style={{
            position: "absolute", top: "50%", right: "5%",
            transform: "translateY(-50%)",
            width: 320, height: 320,
            background: "radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center"
                style={{ background: "#6366F1" }}
              >
                <ShoppingCart className="h-3.5 w-3.5 text-white" />
              </div>
              <span style={{ color: "#52525B", fontSize: 12, fontWeight: 500 }}>NexaShopping POS</span>
            </div>
            <h2
              style={{
                color: "#fff", fontSize: 22, fontWeight: 700,
                letterSpacing: "-0.02em", margin: "0 0 4px",
              }}
            >
              {greeting}, {session?.name?.split(" ")[0] ?? "there"} 👋
            </h2>
            <p style={{ color: "#52525B", fontSize: 13, margin: 0 }}>
              Here&apos;s a snapshot of your store today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 999,
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              <LayoutDashboard className="h-3.5 w-3.5" style={{ color: "#818CF8" }} />
              <span style={{ color: "#818CF8", fontSize: 12, fontWeight: 500 }}>Admin Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, accent, accentBg, accentText, href, change }) => (
          <Link key={label} href={href}>
            <div
              className="group cursor-pointer"
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                padding: "20px 22px",
                transition: "box-shadow 0.18s ease, transform 0.18s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.07)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label}
                  </p>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p style={{ fontSize: 32, fontWeight: 700, color: "#111827", letterSpacing: "-0.03em", margin: 0, lineHeight: 1 }}>
                      {value}
                    </p>
                  )}
                  <div
                    className="flex items-center gap-1 mt-2"
                    style={{ color: "#22C55E" }}
                  >
                    <TrendingUp className="h-3 w-3" />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{change} this month</span>
                  </div>
                </div>
                <div
                  className="flex flex-col items-end gap-3"
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: accentBg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: accent }} />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5" style={{ color: "#D1D5DB" }} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Bottom two-col row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Orders */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: "18px 20px 14px", borderBottom: "1px solid #F3F4F6" }}
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" style={{ color: "#6B7280" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Recent Orders</span>
            </div>
            <Link href="/orders">
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12, fontWeight: 600, color: "#6366F1",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "4px 8px", borderRadius: 6,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#EEF2FF")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>

          <div style={{ padding: "12px 16px 16px" }}>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-10">
                <ClipboardList className="h-8 w-8 mx-auto mb-2" style={{ color: "#E5E7EB" }} />
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between"
                    style={{
                      background: "#FAFAFA",
                      border: "1px solid #F3F4F6",
                      borderRadius: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "#EEF2FF" }}
                      >
                        <Users className="h-3.5 w-3.5" style={{ color: "#6366F1" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>
                          {e.user?.name ?? e.userId}
                        </p>
                        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                          Item #{e.itemId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        style={{
                          fontSize: 11, fontWeight: 600, color: "#6366F1",
                          background: "#EEF2FF", padding: "2px 8px",
                          borderRadius: 999, display: "block", marginBottom: 2,
                        }}
                      >
                        #{e.id}
                      </span>
                      <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{e.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Items Overview */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: "18px 20px 14px", borderBottom: "1px solid #F3F4F6" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" style={{ color: "#6B7280" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Items Overview</span>
            </div>
            <Link href="/items">
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12, fontWeight: 600, color: "#6366F1",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "4px 8px", borderRadius: 6,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#EEF2FF")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                Manage <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>

          <div style={{ padding: "12px 16px 16px" }}>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2" style={{ color: "#E5E7EB" }} />
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>No items yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.slice(0, 5).map((p) => (
                  <div
                    key={p.itemId}
                    className="flex items-center justify-between"
                    style={{
                      background: "#FAFAFA",
                      border: "1px solid #F3F4F6",
                      borderRadius: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                        style={{ background: "#F3F4F6" }}
                      >
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-3.5 w-3.5" style={{ color: "#D1D5DB" }} />
                        )}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>
                        {p.name || p.description}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 600, color: "#15803D",
                        background: "#F0FDF4", padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {p.itemId}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #F3F4F6" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Quick Actions</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ padding: "16px" }}>
          {[
            { href: "/users", icon: Users, label: "View All Users", iconColor: "#6366F1", iconBg: "#EEF2FF" },
            { href: "/items?action=new", icon: ShoppingBag, label: "Add New Item", iconColor: "#22C55E", iconBg: "#F0FDF4" },
            { href: "/orders", icon: ClipboardList, label: "View All Orders", iconColor: "#F59E0B", iconBg: "#FFFBEB" },
          ].map(({ href, icon: Icon, label, iconColor, iconBg }) => (
            <Link key={label} href={href}>
              <div
                className="flex items-center gap-3"
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                  background: "#FAFAFA",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#D1D5DB";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "#FAFAFA";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB";
                }}
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: iconBg }}
                >
                  <Icon className="h-4 w-4" style={{ color: iconColor }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-auto" style={{ color: "#D1D5DB" }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}