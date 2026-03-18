"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
  Package,
  TrendingUp,
  Zap,
  Search,
  ArrowRight,
} from "lucide-react";
import { itemApi } from "@/lib/api";
import type { Item } from "@/types";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ── Hero Slides ───────────────────────────────────────────────────────────
const SLIDES = [
  {
    gradient: "from-amber-500/80 via-orange-500/80 to-rose-500/80",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80",
    tag: "New Arrivals",
    heading: "Shop the Latest\nItems & Deals",
    sub: "Discover curated products at unbeatable prices, delivered fast.",
    cta: "Browse Items",
    href: "#shop",
    icon: Zap,
  },
  {
    gradient: "from-violet-700/80 via-purple-600/80 to-indigo-600/80",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",
    tag: "Top Picks",
    heading: "Quality Products\nHandpicked for You",
    sub: "Our best sellers — loved by thousands of happy customers.",
    cta: "Shop Now",
    href: "#shop",
    icon: Star,
  },
  {
    gradient: "from-emerald-600/80 via-teal-500/80 to-cyan-500/80",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1400&q=80",
    tag: "Best Value",
    heading: "Unbeatable Prices\nEvery Single Day",
    sub: "Save more on every order. NexaShopping — your trusted POS partner.",
    cta: "View Offers",
    href: "#shop",
    icon: TrendingUp,
  },
];

// Static decorative circles — pre-computed to avoid SSR/client hydration mismatch
const CIRCLES = [
  { w: 180, h: 120, t: 10, l: 5, o: 0.15 },
  { w: 90, h: 160, t: 60, l: 80, o: 0.12 },
  { w: 140, h: 140, t: 30, l: 50, o: 0.10 },
  { w: 70, h: 70, t: 70, l: 20, o: 0.18 },
  { w: 200, h: 100, t: 5, l: 60, o: 0.08 },
  { w: 110, h: 180, t: 50, l: 35, o: 0.14 },
  { w: 60, h: 60, t: 80, l: 70, o: 0.20 },
  { w: 150, h: 90, t: 20, l: 90, o: 0.10 },
];

const CATEGORIES = ["All", "Electronics", "Food & Beverage", "Clothing", "Health", "Home", "Books", "Other"];

function ItemCard({ item, onOrder }: { item: Item; onOrder: (item: Item) => void }) {
  const hasImage = item.images && item.images.length > 0;
  const displayName = item.name || item.description;
  const inStock = (item.stock ?? 1) > 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Image */}
      <Link href={`/shop/${item.itemId}`} className="block relative overflow-hidden">
        <div className="aspect-[4/3] relative">
          {hasImage ? (
            <img
              src={item.images![0]}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#f1f5f9,#e2e8f0)" }}
            >
              <Package className="h-16 w-16 text-slate-300" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {item.category && (
              <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                {item.category}
              </span>
            )}
            {!inStock && (
              <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/shop/${item.itemId}`}>
          <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-violet-700 transition-colors">
            {displayName}
          </h3>
        </Link>
        {item.shortDescription && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.shortDescription}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          {item.price != null ? (
            <span className="text-lg font-bold text-slate-900">
              LKR {Number(item.price).toLocaleString()}
            </span>
          ) : (
            <span className="text-sm text-slate-400 italic">Price on request</span>
          )}
          {item.stock != null && item.stock > 0 && (
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              {item.stock} in stock
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Link href={`/shop/${item.itemId}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full h-9 text-xs font-semibold">
              View Details
            </Button>
          </Link>
          <Button
            size="sm"
            disabled={!inStock}
            onClick={() => onOrder(item)}
            className="flex-1 h-9 text-xs font-semibold bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0 hover:from-amber-600 hover:to-violet-700 disabled:opacity-50"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            Order
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [authModal, setAuthModal] = useState(false);
  const [targetItem, setTargetItem] = useState<Item | null>(null);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => setSlideIdx((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(timer);
  }, []);

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      const data = await itemApi.getAll();
      setItems(data);
    } catch { /* services may not be running */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleOrder = (item: Item) => {
    const session = getSession();
    if (!session) {
      setTargetItem(item);
      setAuthModal(true);
    } else {
      router.push(`/my-orders?action=new&itemId=${item.itemId}`);
    }
  };

  // Filter
  const filtered = items.filter((it) => {
    const name = (it.name || it.description).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) ||
      (it.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || it.category === activeCategory;
    return matchSearch && matchCat;
  });

  const slide = SLIDES[slideIdx];
  const SlideIcon = slide.icon;

  return (
    <div className="bg-slate-50">
      {/* ── HERO SLIDER ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[520px] flex items-center transition-all duration-700">
          {/* Unsplash background image */}
          <img
            src={slide.image}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          />
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          {/* Static decorative circles – no Math.random() to prevent hydration mismatch */}
          <div className="absolute inset-0 overflow-hidden">
            {CIRCLES.map((c, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${c.w}px`,
                  height: `${c.h}px`,
                  top: `${c.t}%`,
                  left: `${c.l}%`,
                  opacity: c.o,
                }}
              />
            ))}
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col md:flex-row items-center gap-10">
            {/* Text */}
            <div className="flex-1 text-white">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <SlideIcon className="h-3.5 w-3.5" />
                {slide.tag}
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 whitespace-pre-line drop-shadow">
                {slide.heading}
              </h1>
              <p className="text-white/80 text-lg mb-8 max-w-lg">{slide.sub}</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={slide.href}
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-lg"
                >
                  {slide.cta} <ArrowRight className="h-4 w-4" />
                </a>
                <Link href="/register">
                  <button className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30">
                    Join Free
                  </button>
                </Link>
              </div>
            </div>

            {/* Icon illustration */}
            <div className="hidden md:flex items-center justify-center h-48 w-48 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-2xl">
              <SlideIcon className="h-24 w-24 text-white drop-shadow-xl" />
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`rounded-full transition-all ${i === slideIdx ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50"}`}
            />
          ))}
        </div>
        <button
          onClick={() => setSlideIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setSlideIdx((i) => (i + 1) % SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-3 gap-4">
          {[
            { icon: Package, label: "Items Available", value: items.length },
            { icon: Tag, label: "Categories", value: new Set(items.map(i => i.category).filter(Boolean)).size || 0 },
            { icon: Star, label: "Top Rated", value: "★ 4.9" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5 text-violet-600 h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 leading-none">{loading ? "—" : value}</p>
                <p className="text-[11px] text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP SECTION ───────────────────────────────────────────── */}
      <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Heading + search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Our Items</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "item" : "items"} available`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9 h-10 bg-white"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                ? "text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-700"
                }`}
              style={activeCategory === cat ? { background: "linear-gradient(90deg,#f59e0b,#7c3aed)" } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border bg-white">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto mb-4 text-slate-200" />
            <p className="text-slate-400 text-lg font-medium">
              {items.length === 0 ? "No items in store yet." : "No items match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <ItemCard key={item.itemId} item={item} onOrder={handleOrder} />
            ))}
          </div>
        )}
      </section>

      {/* ── AUTH MODAL ─────────────────────────────────────────────── */}
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
              You need an account to place orders.{" "}
              {targetItem && (
                <span>Ordering: <strong>{targetItem.name || targetItem.description}</strong></span>
              )}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAuthModal(false)}>
                Cancel
              </Button>
              <Link href={`/login?from=/shop/${targetItem?.itemId ?? ""}`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              No account?{" "}
              <Link href="/register" className="text-violet-600 font-medium hover:underline">
                Register free
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
