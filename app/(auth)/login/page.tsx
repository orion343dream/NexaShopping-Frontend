"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Eye, EyeOff, Loader2, UserCheck, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, saveSession, initializeAdmin } from "@/lib/auth";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Seed admin on mount
  useEffect(() => { initializeAdmin(); }, []);

  const from = searchParams.get("from") || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    const result = loginUser(email, password);
    setLoading(false);
    if (!result.success || !result.user) {
      setError(result.error ?? "Login failed");
      return;
    }
    saveSession(result.user);

    // Redirect: admin → dashboard, user → from param or homepage
    if (result.user.role === "admin") {
      router.replace("/dashboard");
    } else {
      router.replace(from ?? "/");
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "#F9FAFB",
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "#0F0F11" }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow orb */}
        <div
          style={{
            position: "absolute", top: "30%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520, height: 520,
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Brand mark */}
        <div className="relative flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: "#6366F1" }}
          >
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <span style={{ color: "#fff", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
            NexaShopping
          </span>
        </div>

        {/* Centered quote / visual */}
        <div className="relative text-center">
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              marginBottom: 28,
            }}
          >
            <Sparkles className="h-3 w-3" style={{ color: "#818CF8" }} />
            <span style={{ color: "#818CF8", fontSize: 12, fontWeight: 500 }}>Seamless commerce</span>
          </div>
          <h2
            style={{
              color: "#fff", fontSize: 38, fontWeight: 700,
              lineHeight: 1.15, letterSpacing: "-0.03em",
              margin: "0 auto", maxWidth: 340,
            }}
          >
            Your store,<br />
            <span style={{ color: "#6366F1" }}>fully in control.</span>
          </h2>
          <p style={{ color: "#71717A", fontSize: 15, marginTop: 16, maxWidth: 320, margin: "16px auto 0", lineHeight: 1.6 }}>
            Manage products, track orders, and delight customers — all from one place.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative flex gap-8">
          {[
            { label: "Orders managed", value: "12,400+" },
            { label: "Uptime", value: "99.9%" },
            { label: "Users", value: "2,800+" },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{s.value}</p>
              <p style={{ color: "#52525B", fontSize: 12, margin: "3px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "#6366F1" }}>
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>NexaShopping</span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Heading */}
          <div className="mb-8">
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: "0 0 6px" }}>
              {from ? "Continue your order" : "Welcome back"}
            </h1>
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>
              Sign in to your NexaShopping account
            </p>
          </div>

          {/* Role hints */}
          <div className="flex gap-3 mb-7">
            <div
              className="flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
              style={{ border: "1px solid #E5E7EB", background: "#FAFAFA" }}
            >
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#EEF2FF" }}
              >
                <Shield className="h-3.5 w-3.5" style={{ color: "#6366F1" }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0 }}>Admin</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>Dashboard access</p>
              </div>
            </div>
            <div
              className="flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
              style={{ border: "1px solid #E5E7EB", background: "#FAFAFA" }}
            >
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#F0FDF4" }}
              >
                <UserCheck className="h-3.5 w-3.5" style={{ color: "#22C55E" }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0 }}>Customer</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>Shop & order</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="email"
                style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{
                  height: 42, borderColor: "#E5E7EB", borderRadius: 10,
                  fontSize: 14, paddingLeft: 12,
                }}
                className="focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{
                    height: 42, borderColor: "#E5E7EB", borderRadius: 10,
                    fontSize: 14, paddingLeft: 12, paddingRight: 40,
                  }}
                  className="focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#6B7280")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
              >
                <span style={{ marginTop: 1 }}>⚠</span>
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-semibold transition-all"
              style={{
                height: 44,
                background: loading ? "#A5B4FC" : "#6366F1",
                color: "#fff",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transform: "scale(1)",
                transition: "background 0.15s, transform 0.1s",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#4F46E5"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#6366F1"; }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
              }
            </Button>
          </form>

          <div
            style={{ borderTop: "1px solid #F3F4F6", marginTop: 24, paddingTop: 20 }}
            className="text-center"
          >
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                style={{ color: "#6366F1", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#4F46E5")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#6366F1")}
              >
                Create one free →
              </Link>
            </p>
          </div>
        </div>

        <p style={{ marginTop: 40, fontSize: 11, color: "#D1D5DB", textAlign: "center" }}>
          NexaShopping POS © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}