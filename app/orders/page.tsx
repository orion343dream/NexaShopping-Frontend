"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { toast } from "sonner";
import {
  Search, CheckCircle2, Truck, XCircle, RotateCcw, Clock,
  RefreshCw, Package, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderApi, itemApi } from "@/lib/api";
import type { Order, OrderStatus, Item } from "@/types";

// Persist statuses in localStorage (backbone service has no status field)
const STATUS_KEY = "nexashopping_order_status";
function loadStatuses(): Record<string, OrderStatus> {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) ?? "{}"); } catch { return {}; }
}
function saveStatuses(s: Record<string, OrderStatus>) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(s));
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  shipped: { label: "Shipped", color: "bg-violet-100 text-violet-700", icon: Truck },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600", icon: XCircle },
  refunded: { label: "Refunded", color: "bg-slate-100 text-slate-600", icon: RotateCcw },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

// Action buttons for each status transition
const STATUS_ACTIONS: Array<{
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  className: string;
}> = [
    { status: "accepted", label: "Accept", icon: CheckCircle2, className: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" },
    { status: "shipped", label: "Ship", icon: Truck, className: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200" },
    { status: "completed", label: "Complete", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" },
    { status: "cancelled", label: "Cancel", icon: XCircle, className: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200" },
    { status: "refunded", label: "Refund", icon: RotateCcw, className: "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200" },
  ];

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [allOrders, allItems] = await Promise.all([orderApi.getAll(), itemApi.getAll()]);
      setOrders(allOrders.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)));
      const m: Record<string, Item> = {};
      allItems.forEach((p) => { m[p.itemId] = p; });
      setItems(m);
      setStatuses(loadStatuses());
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const getStatus = (id: string | number): OrderStatus =>
    statuses[String(id)] ?? "pending";

  const updateStatus = (id: string | number, s: OrderStatus) => {
    const next = { ...statuses, [String(id)]: s };
    setStatuses(next);
    saveStatuses(next);
    toast.success(`Order #${id} marked as ${s}`);
  };

  // Filter
  const filtered = orders.filter((o) => {
    const name = (o.user?.name ?? o.userId).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) ||
      o.itemId.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = statusFilter === "all" || getStatus(o.id ?? "") === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const counts = orders.reduce((acc, o) => {
    const s = getStatus(o.id ?? "");
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm ${statusFilter === s ? "ring-2 ring-violet-400 shadow-sm" : "bg-white"
                }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5 opacity-60" />
                <span className="text-[11px] text-slate-500 font-medium">{cfg.label}</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{counts[s] ?? 0}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | OrderStatus)}>
            <SelectTrigger className="w-36">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2 shrink-0">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right min-w-[220px]">Update Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const item = items[order.itemId];
                const status = getStatus(order.id ?? "");
                return (
                  <TableRow key={order.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-mono text-xs text-slate-400">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                          {item?.images?.[0] ? (
                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 leading-tight">
                            {item?.name || item?.description || order.itemId}
                          </p>
                          <Badge variant="outline" className="font-mono text-[10px] mt-0.5">{order.itemId}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-slate-900">{order.user?.name ?? order.userId}</p>
                      <p className="text-xs text-slate-400 font-mono">{order.userId}</p>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{order.date}</TableCell>
                    <TableCell>
                      {item?.price != null ? (
                        <span className="text-sm font-bold text-slate-800">LKR {Number(item.price).toLocaleString()}</span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </TableCell>
                    <TableCell><StatusBadge status={status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {STATUS_ACTIONS.map(({ status: s, label, icon: Icon, className }) => (
                          status !== s && (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id ?? "", s)}
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors ${className}`}
                            >
                              <Icon className="h-3 w-3" />{label}
                            </button>
                          )
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-slate-400">{filtered.length} of {orders.length} orders shown</p>
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense><AdminOrdersContent /></Suspense>;
}
