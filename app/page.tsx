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
  {
    gradient: "from-pink-600/80 via-rose-500/80 to-red-500/80",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=80",
    tag: "Electronics",
    heading: "Premium Tech\nGear & Gadgets",
    sub: "Discover the latest electronics with exclusive tech deals.",
    cta: "Shop Tech",
    href: "#shop",
    icon: Zap,
  },
  {
    gradient: "from-blue-600/80 via-cyan-500/80 to-teal-500/80",
    image: "https://images.unsplash.com/photo-1552869000-bc6e36c55bed?w=1400&q=80",
    tag: "Fashion",
    heading: "Stylish Fashion\nTrends & Collections",
    sub: "Update your wardrobe with the hottest fashion picks this season.",
    cta: "Explore Fashion",
    href: "#shop",
    icon: Star,
  },
  {
    gradient: "from-indigo-600/80 via-purple-500/80 to-pink-500/80",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1400&q=80",
    tag: "Food & Beverage",
    heading: "Delicious Treats\n& Fresh Items",
    sub: "Premium food and beverage selection, fresh delivery guaranteed.",
    cta: "Order Now",
    href: "#shop",
    icon: TrendingUp,
  },
  {
    gradient: "from-green-600/80 via-emerald-500/80 to-lime-500/80",
    image: "https://images.unsplash.com/photo-1556821552-9f6db051193a?w=1400&q=80",
    tag: "Home & Living",
    heading: "Transform Your\nHome Space",
    sub: "Beautiful home decor and furniture to create your perfect space.",
    cta: "Shop Home",
    href: "#shop",
    icon: Star,
  },
  {
    gradient: "from-orange-600/80 via-amber-500/80 to-yellow-500/80",
    image: "https://images.unsplash.com/photo-1626424026000-8b0531c40f60?w=1400&q=80",
    tag: "Health & Wellness",
    heading: "Health First\nWellness Products",
    sub: "Premium health and wellness items for your daily care routine.",
    cta: "Explore Health",
    href: "#shop",
    icon: Zap,
  },
  {
    gradient: "from-red-600/80 via-rose-500/80 to-pink-500/80",
    image: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=1400&q=80",
    tag: "Sports & Outdoor",
    heading: "Active Lifestyle\nGear & Equipment",
    sub: "Everything you need for sports, fitness, and outdoor adventures.",
    cta: "Shop Sports",
    href: "#shop",
    icon: TrendingUp,
  },
  {
    gradient: "from-purple-600/80 via-indigo-500/80 to-blue-500/80",
    image: "https://images.unsplash.com/photo-1507842722147-2d65e56193c9?w=1400&q=80",
    tag: "Books & Media",
    heading: "Knowledge & \nEntertainment",
    sub: "Explore our curated collection of books, music, and media.",
    cta: "Discover Books",
    href: "#shop",
    icon: Star,
  },
];

const CIRCLES = [
  { w: 180, h: 120, t: 10, l: 5,  o: 0.15 },
  { w: 90,  h: 160, t: 60, l: 80, o: 0.12 },
  { w: 140, h: 140, t: 30, l: 50, o: 0.10 },
  { w: 70,  h: 70,  t: 70, l: 20, o: 0.18 },
  { w: 200, h: 100, t: 5,  l: 60, o: 0.08 },
  { w: 110, h: 180, t: 50, l: 35, o: 0.14 },
  { w: 60,  h: 60,  t: 80, l: 70, o: 0.20 },
  { w: 150, h: 90,  t: 20, l: 90, o: 0.10 },
];

const CATEGORIES = ["All", "Electronics", "Food & Beverage", "Clothing", "Health", "Home", "Books", "Other"];

// ── Item Card ─────────────────────────────────────────────────────────────
function ItemCard({ item, onOrder }: { item: Item; onOrder: (item: Item) => void }) {
  const hasImage = item.images && item.images.length > 0;
  const displayName = item.name || item.description;
  const inStock = (item.stock ?? 1) > 0;
  const [imageIdx, setImageIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const images = hasImage ? item.images! : [];
  const multipleImages = images.length > 1;

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    if (!hasImage) return;
    const interval = setInterval(() => {
      setImageIdx((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [hasImage, images.length]);

  // Product highlights for e-commerce
  const highlights = [
    item.category ? `Category: ${item.category}` : null,
    item.stock && item.stock > 0 ? `${item.stock} in stock` : "Out of stock",
    item.price ? `LKR ${Number(item.price).toLocaleString()}` : "POA",
  ].filter(Boolean);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%)",
        borderRadius: 14,
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "default",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(99,102,241,0.08)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px) scale(1.01)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* Image Carousel Section */}
      <Link href={`/shop/${item.itemId}`} style={{ display: "block", position: "relative", overflow: "hidden" }}>
        <div 
          style={{ 
            aspectRatio: "4/3", 
            position: "relative", 
            overflow: "hidden", 
            background: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)",
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Image carousel container */}
          {hasImage ? (
            <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
              {/* Images with smooth fade transition */}
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${displayName} - ${idx + 1}`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    opacity: idx === imageIdx ? 1 : 0,
                    transition: "opacity 0.6s ease-in-out",
                    transform: idx === imageIdx ? "scale(1)" : "scale(1.02)",
                  }}
                />
              ))}

              {/* Image navigation dots - only show if multiple images */}
              {multipleImages && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 6,
                    zIndex: 10,
                    opacity: isHovering ? 1 : 0.7,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        setImageIdx(idx);
                      }}
                      style={{
                        width: idx === imageIdx ? 20 : 8,
                        height: 8,
                        borderRadius: 999,
                        border: "none",
                        background: idx === imageIdx ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#FFFFFF")}
                      onMouseLeave={e => (e.currentTarget.style.background = idx === imageIdx ? "#FFFFFF" : "rgba(255,255,255,0.6)")}
                    />
                  ))}
                </div>
              )}

              {/* Image counter */}
              {multipleImages && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    zIndex: 10,
                  }}
                >
                  {imageIdx + 1}/{images.length}
                </div>
              )}

              {/* Navigation arrows - only show on hover */}
              {multipleImages && isHovering && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setImageIdx((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    style={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#FFFFFF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      zIndex: 10,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.35)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setImageIdx((prev) => (prev + 1) % images.length);
                    }}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#FFFFFF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      zIndex: 10,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.35)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
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
              <Package style={{ width: 48, height: 48, color: "#D1D5DB", strokeWidth: 1.5 }} />
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <Link href={`/shop/${item.itemId}`} style={{ textDecoration: "none" }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.4,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              transition: "color 0.18s ease",
            }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = "#6366F1")}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = "#111827")}
          >
            {displayName}
          </h3>
        </Link>

        {item.shortDescription && (
          <p
            style={{
              fontSize: 12,
              color: "#6B7280",
              margin: "6px 0 0",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.shortDescription}
          </p>
        )}

        {/* Price row */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {item.price != null ? (
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
              LKR {Number(item.price).toLocaleString()}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>Price on request</span>
          )}
          {item.stock != null && item.stock > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#15803D",
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              {item.stock} left
            </span>
          )}
        </div>

        {/* CTA buttons */}
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <Link href={`/shop/${item.itemId}`} style={{ flex: 1, display: "block" }}>
            <button
              style={{
                width: "100%",
                height: 36,
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.18s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F3F4F6")}
              onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}
            >
              View Details
            </button>
          </Link>
          <button
            disabled={!inStock}
            onClick={() => onOrder(item)}
            style={{
              flex: 1,
              height: 36,
              fontSize: 12,
              fontWeight: 600,
              color: "#FFFFFF",
              background: inStock ? "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)" : "#D1D5DB",
              border: "none",
              borderRadius: 8,
              cursor: inStock ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: inStock ? "0 4px 12px rgba(99,102,241,0.25)" : "none",
            }}
            onMouseEnter={e => { if (inStock) { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(79,70,229,0.35)"; } }}
            onMouseLeave={e => { if (inStock) { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.25)"; } }}
            onMouseDown={e => { if (inStock) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)"; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            <ShoppingCart style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
            Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [authModal, setAuthModal] = useState(false);
  const [targetItem, setTargetItem] = useState<Item | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setSlideIdx((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(timer);
  }, []);

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
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F9FAFB" }}>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ── HERO SLIDER ──────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "relative",
            minHeight: 520,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* BG image */}
          <img
            src={slide.image}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "opacity 0.7s ease",
            }}
          />
          
          {/* Dark subtle overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(17,24,39,0.45) 0%, rgba(17,24,39,0.35) 100%)",
            }}
          />

          {/* Floating card container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              padding: "40px 24px 40px 24px",
              maxWidth: 1280,
              margin: "0 auto",
            }}
          >
            {/* Floating content card */}
            <div
              style={{
                background: "rgba(17, 24, 39, 0.72)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 20,
                padding: "32px 40px",
                maxWidth: 520,
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.08)",
                animation: "fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {/* Tag badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.20) 100%)",
                  border: "1px solid rgba(139,92,246,0.40)",
                  borderRadius: 999,
                  padding: "7px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#E0E7FF",
                  marginBottom: 20,
                  letterSpacing: "0.05em",
                }}
              >
                <SlideIcon style={{ width: 14, height: 14, strokeWidth: 1.8 }} />
                {slide.tag}
              </span>

              {/* Heading */}
              <h1
                style={{
                  fontSize: "clamp(24px, 3.5vw, 40px)",
                  fontWeight: 900,
                  lineHeight: 1.2,
                  margin: "0 0 12px",
                  color: "#FFFFFF",
                  letterSpacing: "-0.015em",
                }}
              >
                {slide.heading}
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255, 255, 255, 0.75)",
                  margin: "0 0 28px",
                  lineHeight: 1.6,
                  maxWidth: 440,
                }}
              >
                {slide.sub}
              </p>

              {/* CTA buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <a
                  href={slide.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "11px 24px",
                    borderRadius: 12,
                    textDecoration: "none",
                    boxShadow: "0 8px 20px rgba(99,102,241,0.35), 0 0 1px rgba(255,255,255,0.3) inset",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    border: "none",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 28px rgba(99,102,241,0.45), 0 0 1px rgba(255,255,255,0.3) inset";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 20px rgba(99,102,241,0.35), 0 0 1px rgba(255,255,255,0.3) inset";
                  }}
                >
                  {slide.cta}
                  <ArrowRight style={{ width: 16, height: 16, strokeWidth: 2.2 }} />
                </a>
                <Link href="/register">
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(255, 255, 255, 0.12)",
                      backdropFilter: "blur(8px)",
                      border: "1.5px solid rgba(255, 255, 255, 0.20)",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      fontSize: 14,
                      padding: "11px 24px",
                      borderRadius: 12,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)";
                      e.currentTarget.style.borders = "1.5px solid rgba(255, 255, 255, 0.32)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                      e.currentTarget.style.border = "1.5px solid rgba(255, 255, 255, 0.20)";
                    }}
                  >
                    Join Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              style={{
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: "#FFFFFF",
                opacity: i === slideIdx ? 1 : 0.45,
                width: i === slideIdx ? 24 : 8,
                height: 8,
                transition: "width 0.25s ease, opacity 0.25s ease",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Prev arrow */}
        <button
          onClick={() => setSlideIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#FFFFFF",
            transition: "background 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.32)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
        >
          <ChevronLeft style={{ width: 18, height: 18, strokeWidth: 1.5 }} />
        </button>

        {/* Next arrow */}
        <button
          onClick={() => setSlideIdx((i) => (i + 1) % SLIDES.length)}
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#FFFFFF",
            transition: "background 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.32)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
        >
          <ChevronRight style={{ width: 18, height: 18, strokeWidth: 1.5 }} />
        </button>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "16px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {[
            { icon: Package,   label: "Items Available", value: items.length },
            { icon: Tag,       label: "Categories",      value: new Set(items.map(i => i.category).filter(Boolean)).size || 0 },
            { icon: Star,      label: "Top Rated",       value: "★ 4.9" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, transition: "transform 0.3s ease" }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(99,102,241,0.15), inset 0 1px 2px rgba(255,255,255,0.5)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 16px rgba(99,102,241,0.25), inset 0 1px 2px rgba(255,255,255,0.5)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.15), inset 0 1px 2px rgba(255,255,255,0.5)"}
              >
                <Icon style={{ width: 18, height: 18, color: "#6366F1", strokeWidth: 1.5 }} />
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1 }}>
                  {loading ? "—" : value}
                </p>
                <p style={{ fontSize: 11, color: "#6B7280", margin: "3px 0 0", letterSpacing: "0.02em" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP SECTION ─────────────────────────────────────────────────── */}
      <section id="shop" style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Heading + search */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#111827",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Our Items
            </h2>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
              {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "item" : "items"} available`}
            </p>
          </div>

          {/* Search input */}
          <div style={{ position: "relative", width: 272, maxWidth: "100%" }}>
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
                height: 40,
                fontSize: 13,
                borderRadius: 8,
                border: "1.5px solid #E5E7EB",
                background: "#FFFFFF",
                transition: "all 0.25s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
              onFocus={e => {
                (e.target as HTMLInputElement).style.borderColor = "#6366F1";
                (e.target as HTMLInputElement).style.boxShadow = "0 4px 14px rgba(99,102,241,0.15), 0 0 0 3px rgba(99,102,241,0.08)";
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = "#E5E7EB";
                (e.target as HTMLInputElement).style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)";
              }}
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  border: active ? "1.5px solid #6366F1" : "1px solid #E5E7EB",
                  background: active ? "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)" : "#FFFFFF",
                  color: active ? "#FFFFFF" : "#374151",
                  boxShadow: active ? "0 4px 12px rgba(99,102,241,0.30)" : "0 1px 3px rgba(0,0,0,0.05)",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#A5B4FC";
                    (e.currentTarget as HTMLButtonElement).style.color = "#6366F1";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
                    (e.currentTarget as HTMLButtonElement).style.color = "#374151";
                  }
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Items grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid #E5E7EB",
                  background: "#FFFFFF",
                }}
              >
                <Skeleton className="w-full" style={{ aspectRatio: "4/3" }} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                  <Skeleton className="h-9 w-full rounded-lg mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
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
            <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>
              {items.length === 0 ? "No items in store yet." : "No items match your search."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((item) => (
              <ItemCard key={item.itemId} item={item} onOrder={handleOrder} />
            ))}
          </div>
        )}
      </section>

      {/* ── AUTH MODAL ───────────────────────────────────────────────────── */}
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

          {/* Panel */}
          <div
            style={{
              position: "relative",
              background: "linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%)",
              borderRadius: 16,
              border: "1.5px solid #E5E7EB",
              boxShadow: "0 24px 64px rgba(0,0,0,0.16), inset 0 1px 2px rgba(255,255,255,0.5)",
              padding: "32px 28px",
              width: "100%",
              maxWidth: 380,
              textAlign: "center",
              animation: "fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
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
              You need an account to place orders.{" "}
              {targetItem && (
                <span>
                  Ordering: <strong style={{ color: "#111827" }}>{targetItem.name || targetItem.description}</strong>
                </span>
              )}
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setAuthModal(false)}
                style={{
                  flex: 1,
                  height: 40,
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#FFFFFF",
                  color: "#374151",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#D1D5DB";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
                }}
              >
                Cancel
              </button>
              <Link href={`/login?from=/shop/${targetItem?.itemId ?? ""}`} style={{ flex: 1 }}>
                <button
                  style={{
                    width: "100%",
                    height: 40,
                    fontSize: 14,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(79,70,229,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.25)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  }}
                >
                  Sign In
                </button>
              </Link>
            </div>

            <p style={{ marginTop: 16, fontSize: 12, color: "#9CA3AF" }}>
              No account?{" "}
              <Link href="/register" style={{ color: "#6366F1", fontWeight: 600, textDecoration: "none" }}>
                Register free
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}