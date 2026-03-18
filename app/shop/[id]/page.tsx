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
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <Package className="h-16 w-16 mx-auto mb-4 text-slate-200" />
      <h2 className="text-xl font-bold text-slate-700 mb-2">Item not found</h2>
      <Link href="/"><Button variant="outline">← Back to Shop</Button></Link>
    </div>
  );

  const displayName = item.name || item.description;
  const imgs = item.images && item.images.length > 0 ? item.images : [];
  const inStock = (item.stock ?? 1) > 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-violet-700 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#shop" className="hover:text-violet-700 transition-colors">Shop</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 font-medium truncate max-w-[200px]">{displayName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── IMAGE GALLERY ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm aspect-square relative group">
              {imgs.length > 0 ? (
                <img
                  src={imgs[activeImg]}
                  alt={displayName}
                  className="w-full h-full object-cover transition-all duration-500"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#f1f5f9,#e2e8f0)" }}
                >
                  <Package className="h-24 w-24 text-slate-300" />
                </div>
              )}
              {/* Nav arrows if multiple images */}
              {imgs.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + imgs.length) % imgs.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % imgs.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imgs.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImg ? "border-violet-500 shadow-md" : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── ITEM INFO ── */}
          <div className="space-y-5">
            {/* Category + ID */}
            <div className="flex items-center gap-2 flex-wrap">
              {item.category && (
                <Badge className="bg-violet-100 text-violet-700 border-0 font-medium">
                  <Tag className="h-3 w-3 mr-1" />
                  {item.category}
                </Badge>
              )}
              <Badge variant="outline" className="font-mono text-slate-500 text-xs">
                ID: {item.itemId}
              </Badge>
              <div className="ml-auto flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
                <span className="text-xs text-slate-500 ml-1">(4.9)</span>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {displayName}
            </h1>

            {/* Short description */}
            {item.shortDescription && (
              <p className="text-slate-500 text-base leading-relaxed">{item.shortDescription}</p>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              {item.price != null ? (
                <>
                  <span className="text-4xl font-extrabold text-slate-900">
                    LKR {Number(item.price).toLocaleString()}
                  </span>
                  <span className="text-slate-400 text-sm pb-1">incl. taxes</span>
                </>
              ) : (
                <span className="text-xl text-slate-400 italic">Price on request</span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-emerald-600 font-semibold text-sm">
                    In Stock {item.stock != null && `(${item.stock} available)`}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="text-red-500 font-semibold text-sm">Out of Stock</span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Full description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                disabled={!inStock}
                onClick={handleOrder}
                className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0 hover:from-amber-600 hover:to-violet-700 disabled:opacity-50 shadow-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {inStock ? "Place Order" : "Out of Stock"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-4"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-slate-400 hover:text-slate-600 gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
            </Button>
          </div>
        </div>
      </div>

      {/* ── AUTH MODAL ── */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAuthModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm text-center">
            <div
              className="h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#f59e0b,#7c3aed)" }}
            >
              <ShoppingCart className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Sign in to Order</h3>
            <p className="text-slate-500 text-sm mb-5">
              You need an account to place orders for <strong>{displayName}</strong>.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAuthModal(false)}>Cancel</Button>
              <Link href={`/login?from=/shop/${params.id}`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              No account?{" "}
              <Link href="/register" className="text-violet-600 font-medium hover:underline">Register free</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Skeleton className="h-4 w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-2xl w-full" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
