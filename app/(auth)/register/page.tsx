"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Eye, EyeOff, Loader2, ArrowRight, User, Phone, Mail, MapPin, KeyRound, Lock, CheckCircle2, Package, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser, saveSession, initializeAdmin } from "@/lib/auth";
import { useEffect } from "react";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:7000";

/** Try to upsert a user record in the backend so orders work.
 *  Silently succeeds if the user already exists. */
async function ensureUserInBackend(params: {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address?: string;
}) {
  try {
    const check = await fetch(`${API_GATEWAY}/api/v1/users/${params.id}`);
    if (check.status === 200) return;

    const formData = new FormData();
    formData.append("nic", params.id);
    formData.append("name", params.name);
    formData.append("address", params.address || "N/A");
    formData.append("mobile", params.mobile);
    formData.append("email", params.email);
    const placeholderBlob = new Blob([], { type: "image/png" });
    formData.append("picture", new File([placeholderBlob], "avatar.png", { type: "image/png" }));

    await fetch(`${API_GATEWAY}/api/v1/users`, {
      method: "POST",
      body: formData,
    });
  } catch {
    console.warn("Could not sync user to user-service");
  }
}

function Field({
  label,
  required,
  hint,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon && <span style={{ color: "#9CA3AF" }}>{icon}</span>}
        <Label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
          {label}
          {required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
          {hint && <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 4 }}>{hint}</span>}
        </Label>
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  height: 40,
  borderColor: "#E5E7EB",
  borderRadius: 8,
  fontSize: 13,
  paddingLeft: 12,
  background: "#fff",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    mobile: "",
    email: "",
    address: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { initializeAdmin(); }, []);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password || !form.name || !form.mobile || !form.email) {
      setError("Username, password, email, full name and mobile are required.");
      return;
    }
    if (form.username.length > 10) {
      setError("Username must be 10 characters or less.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);

    const result = registerUser({
      username: form.username,
      password: form.password,
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      address: form.address || undefined,
    });

    if (!result.success || !result.user) {
      setLoading(false);
      setError(result.error ?? "Registration failed");
      return;
    }

    await ensureUserInBackend({
      id: result.user.id,
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      address: form.address || undefined,
    });

    setLoading(false);
    saveSession(result.user);
    router.replace("/");
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* ── LEFT: Form panel ── */}
      <div
        className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-14 xl:px-20 overflow-y-auto"
        style={{ background: "#F9FAFB", minWidth: 0 }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-9">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#6366F1" }}
          >
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
            NexaShopping
          </span>
        </div>

        {/* Heading */}
        <div className="mb-7 max-w-[440px]">
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: "0 0 6px" }}>
            Create your account
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>
            Join thousands of shoppers — free forever.
          </p>
        </div>

        {/* Form card */}
        <div
          className="w-full max-w-[480px]"
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: "26px 26px 22px",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Personal info */}
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, marginTop: 0 }}>
              Personal Information
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-5">
              <Field label="Full Name" required icon={<User className="h-3.5 w-3.5" />}>
                <Input placeholder="John Doe" value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} className="focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </Field>
              <Field label="Mobile" required icon={<Phone className="h-3.5 w-3.5" />}>
                <Input placeholder="07X XXX XXXX" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} style={inputStyle} className="focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </Field>
              <Field label="Email" required icon={<Mail className="h-3.5 w-3.5" />}>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} className="focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </Field>
              <Field label="Address" icon={<MapPin className="h-3.5 w-3.5" />}>
                <Input placeholder="123 Main St (optional)" value={form.address} onChange={(e) => set("address", e.target.value)} style={inputStyle} className="focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </Field>
            </div>

            <div style={{ borderTop: "1px solid #F3F4F6", marginBottom: 18 }} />

            {/* Credentials */}
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, marginTop: 0 }}>
              Login Credentials
            </p>
            <div className="space-y-4 mb-5">
              <Field label="Username" required hint="(max 10 chars)" icon={<KeyRound className="h-3.5 w-3.5" />}>
                <Input placeholder="Choose a username" maxLength={10} value={form.username} onChange={(e) => set("username", e.target.value)} autoComplete="username" style={inputStyle} className="focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Password" required icon={<Lock className="h-3.5 w-3.5" />}>
                  <div className="relative">
                    <Input
                      type={showPwd ? "text" : "password"}
                      placeholder="Min 4 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      style={{ ...inputStyle, paddingRight: 36 }}
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
                      {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password" required icon={<Lock className="h-3.5 w-3.5" />}>
                  <Input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} style={inputStyle} className="focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
                </Field>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm mb-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
                <span style={{ marginTop: 1 }}>⚠</span>
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
              style={{
                height: 44,
                background: loading ? "#A5B4FC" : "#6366F1",
                color: "#fff",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s, transform 0.1s",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#4F46E5"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#6366F1"; }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
                : <><span>Create Account &amp; Sign In</span><ArrowRight className="h-4 w-4" /></>
              }
            </Button>
          </form>

          <div style={{ borderTop: "1px solid #F3F4F6", marginTop: 18, paddingTop: 16 }} className="text-center">
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
              Already have an account?{" "}
              <Link
                href="/login"
                style={{ color: "#6366F1", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#4F46E5")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#6366F1")}
              >
                Sign in →
              </Link>
            </p>
          </div>
        </div>

        <p style={{ marginTop: 24, fontSize: 11, color: "#D1D5DB" }}>
          NexaShopping POS © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>

      {/* ── RIGHT: Dark decorative panel (lg+) — mirrors login's left panel DNA ── */}
      <div
        className="hidden lg:flex lg:w-[42%] xl:w-[44%] flex-col justify-between p-12 relative overflow-hidden flex-shrink-0"
        style={{ background: "#0F0F11" }}
      >
        {/* Same grid texture as login */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />
        {/* Indigo glow — same radius/opacity as login */}
        <div style={{
          position: "absolute", bottom: "15%", left: "50%",
          transform: "translateX(-50%)",
          width: 500, height: 500,
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Soft green accent (unique to register — growth/new) */}
        <div style={{
          position: "absolute", top: "8%", right: "10%",
          width: 220, height: 220,
          background: "radial-gradient(ellipse at center, rgba(34,197,94,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Top pill badge — mirrors login */}
        <div className="relative">
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 999,
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1", display: "inline-block" }} />
            <span style={{ color: "#818CF8", fontSize: 11, fontWeight: 500 }}>Join NexaShopping today</span>
          </div>
        </div>

        {/* Center headline + feature list */}
        <div className="relative">
          <h2
            style={{
              color: "#fff", fontSize: 34, fontWeight: 700,
              lineHeight: 1.18, letterSpacing: "-0.03em",
              margin: "0 0 28px",
            }}
          >
            Everything you need<br />
            to shop{" "}
            <span style={{ color: "#6366F1" }}>smarter.</span>
          </h2>

          <div className="space-y-5">
            {[
              {
                icon: <Package className="h-4 w-4" />,
                color: "#6366F1",
                bg: "rgba(99,102,241,0.12)",
                title: "Browse thousands of items",
                desc: "Curated catalogue updated daily",
              },
              {
                icon: <Truck className="h-4 w-4" />,
                color: "#22C55E",
                bg: "rgba(34,197,94,0.1)",
                title: "Track orders in real time",
                desc: "From checkout to your doorstep",
              },
              {
                icon: <Star className="h-4 w-4" />,
                color: "#F59E0B",
                bg: "rgba(245,158,11,0.1)",
                title: "Exclusive member deals",
                desc: "Early access to sales & offers",
              },
              {
                icon: <CheckCircle2 className="h-4 w-4" />,
                color: "#6366F1",
                bg: "rgba(99,102,241,0.12)",
                title: "Secure & private",
                desc: "Your data stays yours, always",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3.5">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: item.bg, color: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <p style={{ color: "#E5E7EB", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{item.title}</p>
                  <p style={{ color: "#52525B", fontSize: 12, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial — mirrors login's bottom stats row in spirit */}
        <div
          className="relative"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "18px 20px",
          }}
        >
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5" style={{ color: "#F59E0B", fill: "#F59E0B" }} />
            ))}
          </div>
          <p style={{ color: "#D1D5DB", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px", fontStyle: "italic" }}>
            &ldquo;Setting up was instant and the checkout flow is the smoothest I&apos;ve used.&rdquo;
          </p>
          <div className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "#6366F1", color: "#fff" }}
            >
              S
            </div>
            <div>
              <p style={{ color: "#E5E7EB", fontSize: 12, fontWeight: 600, margin: 0 }}>Sarah K.</p>
              <p style={{ color: "#52525B", fontSize: 11, margin: 0 }}>Verified customer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}