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
  pending:   { label: "Pending",   color: "bg-amber-50 text-amber-700 border border-amber-200",      icon: Clock        },
  accepted:  { label: "Accepted",  color: "bg-blue-50 text-blue-700 border border-blue-200",         icon: CheckCircle2 },
  shipped:   { label: "Shipped",   color: "bg-indigo-50 text-indigo-700 border border-indigo-200",   icon: Truck        },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border border-emerald-200",icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600 border border-red-200",            icon: XCircle      },
  refunded:  { label: "Refunded",  color: "bg-slate-50 text-slate-600 border border-slate-200",      icon: RotateCcw    },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-600 px-2.5 py-1 rounded-full ${cfg.color}`}
      style={{ fontWeight: 600, letterSpacing: "0.02em" }}
    >
      <Icon className="h-3 w-3" style={{ strokeWidth: 1.5 }} />
      {cfg.label}
    </span>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function MyOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlAction = searchParams.get("action");
  const urlItemId = searchParams.get("itemId");

  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);

  const [pendingItem, setPendingItem] = useState<Item | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [newOrderQty, setNewOrderQty] = useState(1);
  const [confirming, setConfirming] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [programs, setPrograms] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({});
  const [qtys, setQtys] = useState<Record<string, number>>({});

  useEffect(() => {
    setStatuses(loadStatuses());
    setQtys(loadQtys());
    setSession(getSession());
  }, []);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      const returnUrl = urlItemId
        ? `/my-orders?action=new&itemId=${urlItemId}`
        : "/my-orders";
      router.replace(`/login?from=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, urlItemId]);

  useEffect(() => {
    if (urlAction !== "new" || !urlItemId) return;
    setLoadingItem(true);
    itemApi.getById(urlItemId)
      .then(setPendingItem)
      .catch(() => toast.error("Item not found"))
      .finally(() => setLoadingItem(false));
  }, [urlAction, urlItemId]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [allEnrollments, allPrograms] = await Promise.all([
        orderApi.getAll(),
        itemApi.getAll(),
      ]);
      setPrograms(allPrograms);
      const s = getSession();
      const mine = s
        ? allEnrollments.filter((e) => e.userId === s.id).sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        : [];
      setOrders(mine);
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

  if (!session) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        background: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #EEF2FF 100%)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Decorative gradient blob background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          background: "radial-gradient(circle at 20% 30%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.06) 0%, transparent 50%)",
          zIndex: 0,
        }}
      />

      {/* ── Page shell ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 64px", position: "relative", zIndex: 1 }}>

        {/* ── Back + Title ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <Link href="/">
            <button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid rgba(99,102,241,0.2)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(249,250,251,0.8) 100%)",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(99,102,241,0.12), 0 0 1px rgba(255,255,255,0.5) inset",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(249,250,251,0.9) 0%, rgba(243,244,246,0.9) 100%)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(99,102,241,0.20), 0 0 1px rgba(255,255,255,0.5) inset";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(249,250,251,0.8) 100%)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.12), 0 0 1px rgba(255,255,255,0.5) inset";
              }}
            >
              <ArrowLeft style={{ width: 18, height: 18, color: "#6366F1", strokeWidth: 2 }} />
            </button>
          </Link>
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 900,
                margin: 0,
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              <ShoppingBag style={{ width: 28, height: 28, color: "#6366F1", strokeWidth: 1.8 }} />
              My Orders
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", margin: "6px 0 0", lineHeight: 1.6 }}>
              Track and manage your purchases with ease
            </p>
          </div>
        </div>

        {/* ── Confirm Order Card ──────────────────────────────────────────── */}
        {urlAction === "new" && urlItemId && (
          <div style={{ marginBottom: 48 }}>
            {loadingItem ? (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(99,102,241,0.15)",
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(12px)",
                  padding: 32,
                  boxShadow: "0 8px 32px rgba(99,102,241,0.15), 0 0 1px rgba(255,255,255,0.6) inset",
                }}
              >
                <div style={{ display: "flex", gap: 24 }}>
                  <Skeleton className="h-32 w-32 rounded-xl" />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            ) : pendingItem ? (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(99,102,241,0.2)",
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(12px)",
                  overflow: "hidden",
                  boxShadow: "0 12px 40px rgba(99,102,241,0.18), 0 0 1px rgba(255,255,255,0.6) inset",
                  transition: "all 0.3s ease",
                  animation: "slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {/* Top accent gradient bar */}
                <div
                  style={{
                    height: 5,
                    background: "linear-gradient(90deg, #6366F1 0%, #7C3AED 50%, #A855F7 100%)",
                  }}
                />

                {/* Header row */}
                <div
                  style={{
                    padding: "18px 28px",
                    borderBottom: "1px solid rgba(229,231,235,0.6)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <ShieldCheck style={{ width: 18, height: 18, color: "#6366F1", strokeWidth: 1.8 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", letterSpacing: "0.01em" }}>
                    Confirm Your Order
                  </span>
                </div>

                <div style={{ padding: "28px 28px 36px" }}>
                  <div style={{ display: "flex", flexDirection: "row", gap: 28, flexWrap: "wrap" }}>
                    {/* Item image */}
                    <div
                      style={{
                        width: 160,
                        height: 160,
                        borderRadius: 14,
                        overflow: "hidden",
                        background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 20px rgba(99,102,241,0.15)",
                      }}
                    >
                      {pendingItem.images?.[0] ? (
                        <img
                          src={pendingItem.images[0]}
                          alt={pendingItem.name || ""}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Package style={{ width: 40, height: 40, color: "#6366F1", strokeWidth: 1.5 }} />
                      )}
                    </div>

                    {/* Item info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {pendingItem.category && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#4338CA",
                            background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
                            borderRadius: 999,
                            padding: "5px 12px",
                            marginBottom: 12,
                            letterSpacing: "0.02em",
                            border: "1px solid rgba(99,102,241,0.2)",
                          }}
                        >
                          <Tag style={{ width: 11, height: 11, strokeWidth: 2 }} />
                          {pendingItem.category}
                        </span>
                      )}

                      <h3
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#111827",
                          margin: 0,
                          lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {pendingItem.name || pendingItem.description}
                      </h3>
                      <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4, fontFamily: "monospace", fontWeight: 500 }}>
                        SKU: {pendingItem.itemId}
                      </p>
                      {pendingItem.shortDescription && (
                        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 10, lineHeight: 1.6, maxWidth: 380 }}>
                          {pendingItem.shortDescription}
                        </p>
                      )}

                      {/* Price + Quantity */}
                      <div
                        style={{
                          marginTop: 24,
                          display: "flex",
                          alignItems: "flex-end",
                          gap: 32,
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Quantity stepper */}
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#6B7280",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: 10,
                            }}
                          >
                            Quantity
                          </label>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0,
                              border: "1.5px solid rgba(99,102,241,0.2)",
                              borderRadius: 10,
                              overflow: "hidden",
                              height: 40,
                              background: "rgba(255,255,255,0.6)",
                              boxShadow: "0 2px 8px rgba(99,102,241,0.08) inset",
                            }}
                          >
                            <button
                              onClick={() => setNewOrderQty((q) => Math.max(1, q - 1))}
                              style={{
                                width: 40,
                                height: 40,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "none",
                                border: "none",
                                borderRight: "1px solid rgba(99,102,241,0.15)",
                                cursor: "pointer",
                                color: "#6366F1",
                                transition: "background 0.2s ease",
                                fontWeight: 600,
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "none")}
                            >
                              <Minus style={{ width: 16, height: 16, strokeWidth: 2 }} />
                            </button>
                            <span
                              style={{
                                width: 44,
                                textAlign: "center",
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#111827",
                              }}
                            >
                              {newOrderQty}
                            </span>
                            <button
                              onClick={() => setNewOrderQty((q) => q + 1)}
                              style={{
                                width: 40,
                                height: 40,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "none",
                                border: "none",
                                borderLeft: "1px solid rgba(99,102,241,0.15)",
                                cursor: "pointer",
                                color: "#6366F1",
                                transition: "background 0.2s ease",
                                fontWeight: 600,
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "none")}
                            >
                              <Plus style={{ width: 16, height: 16, strokeWidth: 2 }} />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        {unitPrice > 0 && (
                          <div>
                            <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4, fontWeight: 500 }}>
                              LKR {unitPrice.toLocaleString()} × {newOrderQty}
                            </p>
                            <p style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg, #111827 0%, #374151 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
                              LKR {(unitPrice * newOrderQty).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* CTA buttons */}
                      <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button
                          onClick={handleConfirmOrder}
                          disabled={confirming}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "12px 24px",
                            background: confirming ? "linear-gradient(135deg, #A5B4FC 0%, #C7D2FE 100%)" : "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: 11,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: confirming ? "not-allowed" : "pointer",
                            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            letterSpacing: "0.01em",
                            boxShadow: "0 6px 16px rgba(99,102,241,0.3)",
                          }}
                          onMouseEnter={e => { if (!confirming) { e.currentTarget.style.background = "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 24px rgba(99,102,241,0.40)"; } }}
                          onMouseLeave={e => { if (!confirming) { e.currentTarget.style.background = "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(99,102,241,0.3)"; } }}
                        >
                          {confirming ? (
                            <><Loader2 style={{ width: 16, height: 16, strokeWidth: 2 }} className="animate-spin" />Placing Order…</>
                          ) : (
                            <><ShoppingCart style={{ width: 16, height: 16, strokeWidth: 2 }} />Confirm Order</>
                          )}
                        </button>
                        <Link href="/">
                          <button
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "12px 24px",
                              background: "rgba(255,255,255,0.7)",
                              color: "#374151",
                              border: "1.5px solid rgba(99,102,241,0.2)",
                              borderRadius: 11,
                              fontSize: 14,
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.25s ease",
                              backdropFilter: "blur(8px)",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)";
                              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(99,102,241,0.12)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.7)";
                              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                            }}
                          >
                            Continue Shopping
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 16,
                  border: "1.5px dashed rgba(239,68,68,0.4)",
                  background: "linear-gradient(135deg, rgba(254,242,242,0.8) 0%, rgba(253,232,232,0.8) 100%)",
                  backdropFilter: "blur(8px)",
                  padding: 56,
                  textAlign: "center",
                }}
              >
                <Package style={{ width: 48, height: 48, color: "rgba(239,68,68,0.4)", margin: "0 auto 16px", strokeWidth: 1.5 }} />
                <p style={{ fontWeight: 700, color: "#DC2626", margin: 0, fontSize: 16 }}>Item not found</p>
                <Link href="/" style={{ fontSize: 14, color: "#6366F1", textDecoration: "none", display: "inline-block", marginTop: 12, fontWeight: 600 }}>
                  ← Back to shop
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Order History ─────────────────────────────────────────────────── */}
        <div>
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              paddingBottom: 18,
              borderBottom: "2px solid rgba(99,102,241,0.15)",
            }}
          >
            <Calendar style={{ width: 20, height: 20, color: "#6366F1", strokeWidth: 1.8 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.01em" }}>
              Order History
            </h2>
            {!loading && orders.length > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                  borderRadius: 999,
                  padding: "4px 10px",
                  boxShadow: "0 2px 6px rgba(99,102,241,0.25)",
                }}
              >
                {orders.length}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                borderRadius: 16,
                border: "1.5px solid rgba(99,102,241,0.1)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(249,250,251,0.7) 100%)",
                backdropFilter: "blur(8px)",
                padding: "72px 40px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <ShoppingBag style={{ width: 28, height: 28, color: "#6366F1", strokeWidth: 1.5 }} />
              </div>
              <p style={{ fontWeight: 700, color: "#111827", margin: 0, fontSize: 17 }}>No orders yet</p>
              <p style={{ fontSize: 14, color: "#6B7280", marginTop: 8 }}>Items you order will appear here</p>
              <Link href="/">
                <button
                  style={{
                    marginTop: 24,
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "12px 28px",
                    background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 11,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: "0 6px 16px rgba(99,102,241,0.3)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 24px rgba(99,102,241,0.40)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(99,102,241,0.3)";
                  }}
                >
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((order) => {
                const prog = findProgram(order.itemId);
                const qty = order.id ? getQty(order.id) : 1;
                const price = prog?.price ?? 0;
                const status = order.id ? getStatus(order.id) : "pending" as OrderStatus;

                return (
                  <div
                    key={order.id}
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(99,102,241,0.15)",
                      background: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(8px)",
                      padding: "18px 22px",
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      cursor: "default",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(99,102,241,0.15), 0 0 1px rgba(255,255,255,0.5) inset";
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.85)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.7)";
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 11,
                        overflow: "hidden",
                        background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
                        border: "1px solid rgba(99,102,241,0.15)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(99,102,241,0.12)",
                      }}
                    >
                      {prog?.images?.[0] ? (
                        <img
                          src={prog.images[0]}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Package style={{ width: 24, height: 24, color: "#6366F1", strokeWidth: 1.5 }} />
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontWeight: 700,
                              color: "#111827",
                              margin: 0,
                              fontSize: 14,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {prog?.name || prog?.description || order.itemId}
                          </p>
                          <p style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginTop: 3, fontWeight: 500 }}>
                            #{order.id} · {order.itemId}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <StatusBadge status={status} />
                          {(status === "completed" || status === "cancelled") && (
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Remove order"
                              style={{
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid rgba(239,68,68,0.2)",
                                background: "rgba(254,242,242,0.6)",
                                borderRadius: 8,
                                cursor: "pointer",
                                color: "#EF4444",
                                transition: "all 0.2s ease",
                                backdropFilter: "blur(4px)",
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(254,242,242,0.9)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(239,68,68,0.15)";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(254,242,242,0.6)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                              }}
                            >
                              <Trash2 style={{ width: 14, height: 14, strokeWidth: 1.8 }} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "4px 20px",
                          marginTop: 8,
                          fontSize: 13,
                          color: "#6B7280",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
                          {order.date}
                        </span>
                        <span>
                          Qty: <strong style={{ color: "#374151" }}>{qty}</strong>
                        </span>
                        {price > 0 && (
                          <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>
                            LKR {(price * qty).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  return (
    <Suspense fallback={
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 12,
        }}
      >
        <Loader2
          style={{ width: 28, height: 28, color: "#6366F1", strokeWidth: 1.5 }}
          className="animate-spin"
        />
        <p style={{ fontSize: 13, color: "#9CA3AF" }}>Loading your orders…</p>
      </div>
    }>
      <MyOrdersContent />
    </Suspense>
  );
}