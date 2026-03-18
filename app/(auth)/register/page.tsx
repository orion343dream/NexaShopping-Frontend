"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Eye, EyeOff, Loader2 } from "lucide-react";
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
    // Check if user exists first
    const check = await fetch(`${API_GATEWAY}/api/v1/users/${params.id}`);
    if (check.status === 200) return; // already exists

    // Create via multipart/form-data
    const formData = new FormData();
    formData.append("nic", params.id);
    formData.append("name", params.name);
    formData.append("address", params.address || "N/A");
    formData.append("mobile", params.mobile);
    formData.append("email", params.email);
    // picture is required by backend entity — send a placeholder
    const placeholderBlob = new Blob([], { type: "image/png" });
    formData.append("picture", new File([placeholderBlob], "avatar.png", { type: "image/png" }));

    await fetch(`${API_GATEWAY}/api/v1/users`, {
      method: "POST",
      body: formData,
    });
  } catch {
    // Non-critical: order confirm will also try this
    console.warn("Could not sync user to user-service");
  }
}

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

    // Register in localStorage
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

    // Sync to user-service so orders work
    await ensureUserInBackend({
      id: result.user.id,        // same as username
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      address: form.address || undefined,
    });

    setLoading(false);
    saveSession(result.user);
    router.replace("/");         // regular users go to homepage
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-violet-600 px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">NexaShopping</h1>
                <p className="text-amber-100 text-xs">Create your account — it&apos;s free!</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name + Mobile */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-medium">Full Name <span className="text-red-500">*</span></Label>
                  <Input placeholder="John Doe" value={form.name} onChange={(e) => set("name", e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-medium">Mobile <span className="text-red-500">*</span></Label>
                  <Input placeholder="07X XXX XXXX" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} className="h-10" />
                </div>
              </div>

              {/* Email + Address */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-medium">Email <span className="text-red-500">*</span></Label>
                  <Input type="email" placeholder="john@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-medium">Address</Label>
                  <Input placeholder="123 Main St" value={form.address} onChange={(e) => set("address", e.target.value)} className="h-10" />
                </div>
              </div>

              {/* Credentials */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Login Credentials</p>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-medium">
                    Username <span className="text-red-500">*</span>
                    <span className="text-slate-400 font-normal text-xs ml-1">(max 10 chars)</span>
                  </Label>
                  <Input
                    placeholder="Choose a username"
                    maxLength={10}
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    autoComplete="username"
                    className="h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 font-medium">Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={showPwd ? "text" : "password"}
                        placeholder="Min 4 chars"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        className="h-10 pr-10"
                      />
                      <button type="button" onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 font-medium">Confirm Password <span className="text-red-500">*</span></Label>
                    <Input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className="h-10" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-600 hover:to-violet-700 text-white font-semibold shadow-md"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? "Creating account…" : "Create Account & Sign In"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700 underline underline-offset-2">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
