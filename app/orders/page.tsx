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

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; dot: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   color: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "#F59E0B", icon: Clock        },
  accepted:  { label: "Accepted",  color: "bg-blue-50 text-blue-700 border border-blue-200",          dot: "#3B82F6", icon: CheckCircle2 },
  shipped:   { label: "Shipped",   color: "bg-indigo-50 text-indigo-700 border border-indigo-200",    dot: "#6366F1", icon: Truck        },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "#22C55E", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600 border border-red-200",             dot: "#EF4444", icon: XCircle      },
  refunded:  { label: "Refunded",  color: "bg-slate-50 text-slate-600 border border-slate-200",       dot: "#9CA3AF", icon: RotateCcw    },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full ${cfg.color}`}
      style={{ fontWeight: 600, letterSpacing: "0.02em" }}
    >
      <Icon className="h-3 w-3" style={{ strokeWidth: 1.5 }} />
      {cfg.label}
    </span>
  );
}

const STATUS_ACTIONS: Array<{
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  style: React.CSSProperties;
  hoverBg: string;
}> = [
  {
    status: "accepted", label: "Accept", icon: CheckCircle2,
    style: { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" },
    hoverBg: "#DBEAFE",
  },
  {
    status: "shipped", label: "Ship", icon: Truck,
    style: { background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE" },
    hoverBg: "#E0E7FF",
  },
  {
    status: "completed", label: "Complete", icon: CheckCircle2,
    style: { background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" },
    hoverBg: "#DCFCE7",
  },
  {
    status: "cancelled", label: "Cancel", icon: XCircle,
    style: { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" },
    hoverBg: "#FEE2E2",
  },
  {
    status: "refunded", label: "Refund", icon: RotateCcw,
    style: { background: "#F9FAFB", color: "#6B7280", border: "1px solid #E5E7EB" },
    hoverBg: "#F3F4F6",
  },
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

  const filtered = orders.filter((o) => {
    const name = (o.user?.name ?? o.userId).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) ||
      o.itemId.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = statusFilter === "all" || getStatus(o.id ?? "") === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = orders.reduce((acc, o) => {
    const s = getStatus(o.id ?? "");
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* ── Stat chips ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 12,
        }}
      >
        {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              style={{
                borderRadius: 10,
                border: active ? `1.5px solid #6366F1` : "1px solid #E5E7EB",
                background: active ? "#EEF2FF" : "#FFFFFF",
                padding: "12px 14px",
                textAlign: "left",
                cursor: "pointer",
                transition: "box-shadow 0.18s ease, border-color 0.18s ease",
                boxShadow: active ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: cfg.dot,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#6B7280",
                    letterSpacing: "0.02em",
                  }}
                >
                  {cfg.label}
                </span>
              </div>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {counts[s] ?? 0}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 0 }}>
          {/* Search */}
          <div style={{ position: "relative", width: 260, maxWidth: "100%" }}>
            <Search
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 15,
                height: 15,
                color: "#9CA3AF",
                strokeWidth: 1.5,
                pointerEvents: "none",
              }}
            />
            <Input
              style={{
                paddingLeft: 34,
                height: 38,
                fontSize: 13,
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
              }}
              placeholder="Search orders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | OrderStatus)}>
            <SelectTrigger
              style={{
                width: 148,
                height: 38,
                fontSize: 13,
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
              }}
            >
              <Filter style={{ width: 13, height: 13, color: "#9CA3AF", marginRight: 6, strokeWidth: 1.5 }} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Refresh */}
        <button
          onClick={refresh}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "#374151",
            cursor: "pointer",
            transition: "background 0.18s ease",
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#F3F4F6")}
          onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}
        >
          <RefreshCw style={{ width: 14, height: 14, strokeWidth: 1.5, color: "#6B7280" }} />
          Refresh
        </button>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          background: "#FFFFFF",
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ background: "#F9FAFB" }}>
              <TableHead style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", width: 56 }}>
                #
              </TableHead>
              <TableHead style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Item
              </TableHead>
              <TableHead style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Customer
              </TableHead>
              <TableHead style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Date
              </TableHead>
              <TableHead style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Price
              </TableHead>
              <TableHead style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Status
              </TableHead>
              <TableHead style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "right", minWidth: 240 }}>
                Update Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <Package style={{ width: 22, height: 22, color: "#D1D5DB", strokeWidth: 1.5 }} />
                    </div>
                    <p style={{ fontWeight: 600, color: "#374151", margin: 0, fontSize: 14 }}>No orders found</p>
                    <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>Try adjusting your search or filter</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const item = items[order.itemId];
                const status = getStatus(order.id ?? "");
                return (
                  <TableRow
                    key={order.id}
                    style={{ transition: "background 0.18s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* ID */}
                    <TableCell>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#9CA3AF" }}>
                        #{order.id}
                      </span>
                    </TableCell>

                    {/* Item */}
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "#F3F4F6",
                            border: "1px solid #E5E7EB",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item?.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <Package style={{ width: 16, height: 16, color: "#D1D5DB", strokeWidth: 1.5 }} />
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.3 }}>
                            {item?.name || item?.description || order.itemId}
                          </p>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "monospace",
                              color: "#6B7280",
                              background: "#F3F4F6",
                              borderRadius: 4,
                              padding: "1px 5px",
                              border: "1px solid #E5E7EB",
                              display: "inline-block",
                              marginTop: 3,
                            }}
                          >
                            {order.itemId}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: 0 }}>
                        {order.user?.name ?? order.userId}
                      </p>
                      <p style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginTop: 1 }}>
                        {order.userId}
                      </p>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>{order.date}</span>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      {item?.price != null ? (
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                          LKR {Number(item.price).toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: "#D1D5DB", fontSize: 13 }}>—</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        {STATUS_ACTIONS.map(({ status: s, label, icon: Icon, style: btnStyle, hoverBg }) => (
                          status !== s && (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id ?? "", s)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "4px 9px",
                                borderRadius: 6,
                                cursor: "pointer",
                                transition: "background 0.18s ease, transform 0.18s ease",
                                letterSpacing: "0.01em",
                                ...btnStyle,
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = hoverBg;
                                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = btnStyle.background as string;
                                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                              }}
                            >
                              <Icon style={{ width: 11, height: 11, strokeWidth: 1.5 }} />
                              {label}
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

      {/* Footer count */}
      <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
        {filtered.length} of {orders.length} orders shown
      </p>
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense><AdminOrdersContent /></Suspense>;
}