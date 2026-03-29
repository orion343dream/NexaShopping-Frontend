"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Package,
  Tag,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronRight,
  Star,
  Share2,
  Loader2,
} from "lucide-react";
import { itemApi } from "@/lib/api";
import type { Item } from "@/types";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [authModal, setAuthModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await itemApi.getById(params.id);
        setItem(data);
      } catch {
        toast.error("Item not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleOrder = () => {
    const session = getSession();
    if (!session) {
      setAuthModal(true);
    } else {
      router.push(`/my-orders?action=new&itemId=${params.id}`);
    }
  };

  if (loading) return <ItemDetailSkeleton />;
  if (!item) return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        maxWidth: 960,
        margin: "0 auto",
        padding: "96px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Package style={{ width: 28, height: 28, color: "#D1D5DB", strokeWidth: 1.5 }} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Item not found</h2>
      <Link href="/">
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: "#FFFFFF",
            color: "#374151",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          ← Back to Shop
        </button>
      </Link>
    </div>
  );

  const displayName = item.name || item.description;
  const imgs = item.images && item.images.length > 0 ? item.images : [];
  const inStock = (item.stock ?? 1) > 0;

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        background: "#F9FAFB",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#9CA3AF",
            marginBottom: 28,
          }}
        >
          <Link
            href="/"
            style={{
              color: "#6B7280",
              textDecoration: "none",
              transition: "color 0.18s ease",
            }}
            onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = "#6366F1")}
            onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = "#6B7280")}
          >
            Home
          </Link>
          <ChevronRight style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
          <Link
            href="/#shop"
            style={{
              color: "#6B7280",
              textDecoration: "none",
              transition: "color 0.18s ease",
            }}
            onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = "#6366F1")}
            onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = "#6B7280")}
          >
            Shop
          </Link>
          <ChevronRight style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
          <span
            style={{
              color: "#111827",
              fontWeight: 500,
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </span>
        </nav>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* ── IMAGE GALLERY ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Main image */}
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                aspectRatio: "1 / 1",
                position: "relative",
              }}
            >
              {imgs.length > 0 ? (
                <img
                  src={imgs[activeImg]}
                  alt={displayName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.25s ease",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
                  }}
                >
                  <Package style={{ width: 64, height: 64, color: "#D1D5DB", strokeWidth: 1.5 }} />
                </div>
              )}

              {/* Nav arrows */}
              {imgs.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + imgs.length) % imgs.length)}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.92)",
                      border: "1px solid #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "background 0.18s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FFFFFF")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.92)")}
                  >
                    <ChevronLeft style={{ width: 16, height: 16, color: "#374151", strokeWidth: 1.5 }} />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % imgs.length)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.92)",
                      border: "1px solid #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "background 0.18s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FFFFFF")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.92)")}
                  >
                    <ChevronRight style={{ width: 16, height: 16, color: "#374151", strokeWidth: 1.5 }} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {imgs.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      flexShrink: 0,
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: i === activeImg ? "2px solid #6366F1" : "2px solid #E5E7EB",
                      cursor: "pointer",
                      opacity: i === activeImg ? 1 : 0.65,
                      transition: "border-color 0.18s ease, opacity 0.18s ease",
                      padding: 0,
                      background: "none",
                    }}
                    onMouseEnter={e => { if (i !== activeImg) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                    onMouseLeave={e => { if (i !== activeImg) (e.currentTarget as HTMLButtonElement).style.opacity = "0.65"; }}
                  >
                    <img
                      src={src}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── ITEM INFO ──────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Category + ID + Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {item.category && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#4338CA",
                    background: "#EEF2FF",
                    borderRadius: 999,
                    padding: "3px 10px",
                    letterSpacing: "0.02em",
                  }}
                >
                  <Tag style={{ width: 10, height: 10, strokeWidth: 1.5 }} />
                  {item.category}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#6B7280",
                  background: "#F3F4F6",
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                  padding: "2px 8px",
                }}
              >
                {item.itemId}
              </span>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    style={{ width: 13, height: 13, color: "#F59E0B", fill: "#F59E0B", strokeWidth: 0 }}
                  />
                ))}
                <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 4 }}>(4.9)</span>
              </div>
            </div>

            {/* Name */}
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#111827",
                margin: 0,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
              }}
            >
              {displayName}
            </h1>

            {/* Short description */}
            {item.shortDescription && (
              <p style={{ fontSize: 14, color: "#6B7280", margin: 0, lineHeight: 1.7 }}>
                {item.shortDescription}
              </p>
            )}

            {/* Price */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              {item.price != null ? (
                <>
                  <span style={{ fontSize: 32, fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                    LKR {Number(item.price).toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: "#9CA3AF", paddingBottom: 3 }}>incl. taxes</span>
                </>
              ) : (
                <span style={{ fontSize: 18, color: "#9CA3AF", fontStyle: "italic" }}>Price on request</span>
              )}
            </div>

            {/* Stock status */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {inStock ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#15803D",
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    borderRadius: 999,
                    padding: "4px 12px",
                  }}
                >
                  <CheckCircle2 style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
                  In Stock {item.stock != null && `· ${item.stock} available`}
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#DC2626",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 999,
                    padding: "4px 12px",
                  }}
                >
                  <XCircle style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #F3F4F6" }} />

            {/* Full description */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 10px",
                }}
              >
                Description
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.75,
                  margin: 0,
                  whiteSpace: "pre-line",
                }}
              >
                {item.description}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button
                disabled={!inStock}
                onClick={handleOrder}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  height: 48,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  background: inStock ? "#6366F1" : "#D1D5DB",
                  border: "none",
                  borderRadius: 10,
                  cursor: inStock ? "pointer" : "not-allowed",
                  transition: "background 0.18s ease, transform 0.18s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={e => { if (inStock) (e.currentTarget as HTMLButtonElement).style.background = "#4F46E5"; }}
                onMouseLeave={e => { if (inStock) (e.currentTarget as HTMLButtonElement).style.background = "#6366F1"; }}
                onMouseDown={e => { if (inStock) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
              >
                <ShoppingCart style={{ width: 18, height: 18, strokeWidth: 1.5 }} />
                {inStock ? "Place Order" : "Out of Stock"}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
                style={{
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "#6B7280",
                  transition: "background 0.18s ease, color 0.18s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6";
                  (e.currentTarget as HTMLButtonElement).style.color = "#111827";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
                  (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
                }}
              >
                <Share2 style={{ width: 16, height: 16, strokeWidth: 1.5 }} />
              </button>
            </div>

            {/* Back link */}
            <button
              onClick={() => router.back()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                color: "#9CA3AF",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.18s ease",
                alignSelf: "flex-start",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
            >
              <ArrowLeft style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
              Back to Shop
            </button>
          </div>
        </div>
      </div>

      {/* ── AUTH MODAL ─────────────────────────────────────────────────────── */}
      {authModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setAuthModal(false)}
          />

          {/* Modal panel */}
          <div
            style={{
              position: "relative",
              background: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid #E5E7EB",
              boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
              padding: "32px 28px",
              width: "100%",
              maxWidth: 380,
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#6366F1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <ShoppingCart style={{ width: 24, height: 24, color: "#FFFFFF", strokeWidth: 1.5 }} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
              Sign in to Order
            </h3>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px", lineHeight: 1.6 }}>
              You need an account to place orders for{" "}
              <strong style={{ color: "#111827" }}>{displayName}</strong>.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setAuthModal(false)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#FFFFFF",
                  color: "#374151",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.18s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F3F4F6")}
                onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}
              >
                Cancel
              </button>
              <Link href={`/login?from=/shop/${params.id}`} style={{ flex: 1, display: "block" }}>
                <button
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: "#6366F1",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.18s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#4F46E5")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#6366F1")}
                >
                  Sign In
                </button>
              </Link>
            </div>

            <p style={{ marginTop: 16, fontSize: 12, color: "#9CA3AF" }}>
              No account?{" "}
              <Link
                href="/register"
                style={{ color: "#6366F1", fontWeight: 600, textDecoration: "none" }}
              >
                Register free
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemDetailSkeleton() {
  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        background: "#F9FAFB",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <Skeleton className="h-4 w-48 mb-7 rounded" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 40,
          }}
        >
          <Skeleton className="rounded-2xl w-full" style={{ aspectRatio: "1/1" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton className="h-5 w-1/3 rounded" />
            <Skeleton className="h-9 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-10 w-2/5 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}