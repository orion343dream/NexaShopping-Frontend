"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  ShoppingCart,
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
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    setSession(getSession());
    async function load() {
      // Fetch each independently so one down service doesn't block all stats
      const [users, progs, orders] = await Promise.all([
        userApi.getAll().catch((e) => { console.warn("user-service:", e.message); return []; }),
        itemApi.getAll().catch((e) => { console.warn("item-service:", e.message); return []; }),
        orderApi.getAll().catch((e) => { console.warn("order-service:", e.message); return []; }),
      ]);
      setStats({
        users: users.length,
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
      value: stats?.users ?? 0,
      icon: Users,
      gradient: "from-amber-400 to-amber-600",
      bg: "bg-amber-50",
      color: "text-amber-600",
      href: "/users",
    },
    {
      label: "Total Items",
      value: stats?.items ?? 0,
      icon: ShoppingBag,
      gradient: "from-violet-400 to-violet-600",
      bg: "bg-violet-50",
      color: "text-violet-600",
      href: "/items",
    },
    {
      label: "Total Orders",
      value: stats?.orders ?? 0,
      icon: ClipboardList,
      gradient: "from-emerald-400 to-emerald-600",
      bg: "bg-emerald-50",
      color: "text-emerald-600",
      href: "/orders",
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#f59e0b 0%,#7c3aed 100%)" }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">NexaShopping POS</span>
          </div>
          <h2 className="text-2xl font-bold">
            {greeting}, {session?.name?.split(" ")[0] ?? "there"}! 👋
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Here&apos;s a snapshot of your store today.
          </p>
        </div>
        <TrendingUp className="absolute right-6 top-1/2 -translate-y-1/2 h-20 w-20 opacity-10" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, bg, color, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-slate-100">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                    )}
                  </div>
                  <div className={`${bg} rounded-xl p-3`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-violet-600 gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No orders yet</p>
            ) : (
              recentOrders.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50/50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {e.user?.name ?? e.userId}
                    </p>
                    <p className="text-xs text-slate-500">Item: {e.itemId}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">#{e.id}</Badge>
                    <p className="text-xs text-slate-400 mt-1">{e.date}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Items Overview */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Items Overview</CardTitle>
            <Link href="/items">
              <Button variant="ghost" size="sm" className="text-violet-600 gap-1">
                Manage <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : items.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No items yet</p>
            ) : (
              items.slice(0, 5).map((p) => (
                <div
                  key={p.itemId}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50/50"
                >
                  <p className="text-sm font-medium text-slate-900">{p.name || p.description}</p>
                  <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0">
                    {p.itemId}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href="/users">
              <Button variant="outline" className="w-full justify-start gap-2 h-12">
                <Users className="h-4 w-4 text-amber-500" />
                View All Users
              </Button>
            </Link>
            <Link href="/items?action=new">
              <Button variant="outline" className="w-full justify-start gap-2 h-12">
                <ShoppingBag className="h-4 w-4 text-violet-500" />
                Add New Item
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="w-full justify-start gap-2 h-12">
                <ClipboardList className="h-4 w-4 text-emerald-500" />
                View All Orders
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
