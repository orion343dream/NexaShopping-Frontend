"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";
import { Loader2 } from "lucide-react";

// Public paths: accessible without login
const PUBLIC_PATHS = ["/login", "/register"];
// Exact public root (homepage) + prefix /shop
function isPublicPath(p: string) {
  return p === "/" || p.startsWith("/shop") || PUBLIC_PATHS.some(a => p.startsWith(a));
}

// Admin-only paths: redirect regular users away
const ADMIN_PATHS = ["/dashboard", "/items", "/users", "/orders"];
function isAdminPath(p: string) {
  return ADMIN_PATHS.some(a => p.startsWith(a));
}

/** Guards protected routes; shows spinner while checking localStorage */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getSession();
    const pub = isPublicPath(pathname);
    const adminOnly = isAdminPath(pathname);

    // Not logged in → send to login (unless already on public)
    if (!session && !pub) {
      router.replace("/login");
      return;
    }

    // Admin trying to go to admin path: OK
    // Regular user trying to go to admin path: redirect to homepage
    if (session && adminOnly && !isAdmin()) {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return <>{children}</>;
}
