"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Eye, EyeOff, Loader2, UserCheck, Shield } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-violet-600 px-8 py-7 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">NexaShopping</h1>
                <p className="text-amber-100 text-xs">Point of Sale System</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/80">
              {from ? "Sign in to continue your order" : "Welcome back — sign in to continue"}
            </p>
          </div>

          {/* Credential hints */}
          <div className="px-8 pt-5 flex gap-3">
            <div className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Shield className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[11px] font-bold text-amber-700">Admin</span>
              </div>
              <p className="text-[10px] text-amber-600 font-mono">Login as an Administrator</p>
            </div>
            <div className="flex-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <UserCheck className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-[11px] font-bold text-violet-700">User</span>
              </div>
              <p className="text-[10px] text-violet-600">Login as a Customer</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-11 border-slate-200 focus:border-violet-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 pr-10 border-slate-200 focus:border-violet-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-600 hover:to-violet-700 text-white font-semibold shadow-md"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-violet-600 hover:text-violet-700 underline underline-offset-2">
                Register here
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          NexaShopping POS © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
