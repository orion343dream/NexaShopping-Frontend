"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package, ShoppingCart, ArrowLeft, Tag, Calendar,
  CheckCircle2, Truck, XCircle, RotateCcw, Clock,
  Minus, Plus, ShieldCheck, Loader2, ShoppingBag, Trash2
} from "lucide-react";
import { orderApi, itemApi } from "@/lib/api";
import type { Order, OrderStatus, Item } from "@/types";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STATUS_KEY = "nexashopping_order_status";
const QTY_KEY = "nexashopping_order_qty";

function loadStatuses(): Record<string, OrderStatus> {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) ?? "{}"); } catch { return {}; }
}
function loadQtys(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(QTY_KEY) ?? "{}"); } catch { return {}; }
}

// ─── Status badge ─────────────────────────────────────────────────────────────
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
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function MyOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlAction = searchParams.get("action");
  const urlItemId = searchParams.get("itemId");

  // Auth — initialise null to avoid SSR hydration mismatch (localStorage is client-only)
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);

  // Order confirm
  const [pendingItem, setPendingItem] = useState<Item | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [newOrderQty, setNewOrderQty] = useState(1);
  const [confirming, setConfirming] = useState(false);

  // Order history
  const [orders, setOrders] = useState<Order[]>([]);
  const [programs, setPrograms] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({});
  const [qtys, setQtys] = useState<Record<string, number>>({});

  // Load statuses/qtys from localStorage
  useEffect(() => {
    setStatuses(loadStatuses());
    setQtys(loadQtys());
    setSession(getSession());
  }, []);

  // ── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = getSession();
    if (!s) {
      // Redirect to login with return URL
      const returnUrl = urlItemId
        ? `/my-orders?action=new&itemId=${urlItemId}`
        : "/my-orders";
      router.replace(`/login?from=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, urlItemId]);

  // ── Fetch item for confirm card ────────────────────────────────────────────
  useEffect(() => {
    if (urlAction !== "new" || !urlItemId) return;
    setLoadingItem(true);
    itemApi.getById(urlItemId)
      .then(setPendingItem)
      .catch(() => toast.error("Item not found"))
      .finally(() => setLoadingItem(false));
  }, [urlAction, urlItemId]);

  // ── Fetch order history ────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [allEnrollments, allPrograms] = await Promise.all([
        orderApi.getAll(),
        itemApi.getAll(),
      ]);
      setPrograms(allPrograms);
      const s = getSession();
      // Filter to only this user's orders
      const mine = s
        ? allEnrollments.filter((e) => e.userId === s.id).sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        : [];
      setOrders(mine);
      // Refresh localStorage statuses
      setStatuses(loadStatuses());
      setQtys(loadQtys());
    } catch {
      // Services may not be running
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const getStatus = (id: string | number): OrderStatus => statuses[String(id)] ?? "pending";
  const getQty = (id: string | number): number => qtys[String(id)] ?? 1;
  const findProgram = (itemId: string) => programs.find((p) => p.itemId === itemId);

  // ── Confirm order handler ──────────────────────────────────────────────────
  const handleConfirmOrder = async () => {
    const s = getSession();
    if (!s || !urlItemId) return;

    setConfirming(true);
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const created = await orderApi.create({
        userId: s.id,
        itemId: urlItemId,
        date: dateStr,
      });

      // Save local meta (status & qty)
      const sid = String(created.id);
      const nextStatuses = { ...loadStatuses(), [sid]: "pending" as OrderStatus };
      const nextQtys = { ...loadQtys(), [sid]: newOrderQty };
      localStorage.setItem(STATUS_KEY, JSON.stringify(nextStatuses));
      localStorage.setItem(QTY_KEY, JSON.stringify(nextQtys));

      toast.success("🎉 Order placed successfully!");
      router.replace("/my-orders");
      fetchOrders();
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const handleDeleteOrder = async (orderId: number | undefined) => {
    if (!orderId) return;
    try {
      await orderApi.delete(orderId);
      toast.success("Order removed from history");

      // Remove from localStorage
      const sid = String(orderId);
      const nextStatuses = { ...loadStatuses() };
      const nextQtys = { ...loadQtys() };
      delete nextStatuses[sid];
      delete nextQtys[sid];
      localStorage.setItem(STATUS_KEY, JSON.stringify(nextStatuses));
      localStorage.setItem(QTY_KEY, JSON.stringify(nextQtys));

      fetchOrders();
    } catch {
      toast.error("Failed to remove order");
    }
  };

  const unitPrice = pendingItem?.price ?? 0;

  if (!session) return null; // redirect happens in useEffect

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Back + Title ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full border border-slate-200 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-violet-600" />
            My Orders
          </h1>
          <p className="text-sm text-slate-500">Manage your orders and track delivery status</p>
        </div>
      </div>

      {/* ── Confirm Order Card ──────────────────────────────────────────── */}
      {urlAction === "new" && urlItemId && (
        <div className="mb-10">
          {loadingItem ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-8">
              <div className="flex gap-6">
                <Skeleton className="h-32 w-32 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          ) : pendingItem ? (
            <div className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-50 via-white to-violet-50 shadow-lg overflow-hidden">
              {/* Header stripe */}
              <div className="bg-gradient-to-r from-amber-500 to-violet-600 px-6 py-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-white" />
                <span className="text-white font-semibold text-sm">Confirm Your Order</span>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Item image */}
                  <div className="w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    {pendingItem.images?.[0] ? (
                      <img src={pendingItem.images[0]} alt={pendingItem.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-12 w-12 text-slate-300" />
                    )}
                  </div>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    {pendingItem.category && (
                      <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 mb-2">
                        <Tag className="h-3 w-3 mr-1" />{pendingItem.category}
                      </Badge>
                    )}
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      {pendingItem.name || pendingItem.description}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      Item Code: <span className="font-mono text-slate-400">{pendingItem.itemId}</span>
                    </p>
                    {pendingItem.shortDescription && (
                      <p className="text-slate-500 text-sm mt-2">{pendingItem.shortDescription}</p>
                    )}

                    {/* Price + Quantity */}
                    <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      {/* Quantity selector */}
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Quantity</label>
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                          <Button
                            variant="ghost" size="icon" className="h-9 w-9 rounded-md"
                            onClick={() => setNewOrderQty((q) => Math.max(1, q - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center text-lg font-bold text-slate-900">{newOrderQty}</span>
                          <Button
                            variant="ghost" size="icon" className="h-9 w-9 rounded-md"
                            onClick={() => setNewOrderQty((q) => q + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Price breakdown */}
                      {unitPrice > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400">
                            LKR {unitPrice.toLocaleString()} × {newOrderQty}
                          </p>
                          <p className="text-2xl font-bold text-slate-900">
                            LKR {(unitPrice * newOrderQty).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm button */}
                    <div className="mt-6 flex gap-3">
                      <Button
                        onClick={handleConfirmOrder}
                        disabled={confirming}
                        className="bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0 shadow-md hover:from-amber-600 hover:to-violet-700 font-semibold h-11 px-8 text-base"
                      >
                        {confirming ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Placing Order…</>
                        ) : (
                          <><ShoppingCart className="h-4 w-4 mr-2" />Confirm Order</>
                        )}
                      </Button>
                      <Link href="/">
                        <Button variant="outline" className="h-11">
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50 p-8 text-center text-red-500">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="font-medium">Item not found</p>
              <Link href="/" className="text-sm text-violet-600 hover:underline mt-1 inline-block">← Back to shop</Link>
            </div>
          )}
        </div>
      )}

      {/* ── Order History ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-violet-600" />
          Order History
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No orders yet</p>
            <p className="text-sm text-slate-400 mt-1">Items you order will appear here</p>
            <Link href="/">
              <Button className="mt-4 bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const prog = findProgram(order.itemId);
              const qty = getQty(order.id);
              const price = prog?.price ?? 0;
              const status = getStatus(order.id);

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 border shrink-0 flex items-center justify-center">
                      {prog?.images?.[0] ? (
                        <img src={prog.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-7 w-7 text-slate-300" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {prog?.name || prog?.description || order.itemId}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">#{order.id} · {order.itemId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={status} />
                          {(status === "completed" || status === "cancelled") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Remove order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {order.date}
                        </span>
                        <span>Qty: <strong className="text-slate-700">{qty}</strong></span>
                        {price > 0 && (
                          <span className="font-semibold text-slate-900">
                            LKR {(price * qty).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-500" />
        <p className="text-sm text-slate-400 mt-3">Loading your orders…</p>
      </div>
    }>
      <MyOrdersContent />
    </Suspense>
  );
}
