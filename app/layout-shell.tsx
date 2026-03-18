"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PublicNav } from "@/components/layout/public-nav";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { initializeAdmin } from "@/lib/auth";

// Exact public root + prefixes that are public-storefront
function isPublicPath(p: string) {
  return p === "/" || p.startsWith("/shop") || p.startsWith("/my-orders");
}

// Auth pages have their own full-page designs
function isAuthPath(p: string) {
  return p.startsWith("/login") || p.startsWith("/register");
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Seed the hardcoded admin account into localStorage on every mount
  useEffect(() => { initializeAdmin(); }, []);

  if (isAuthPath(pathname)) {
    return <>{children}</>;
  }

  if (isPublicPath(pathname)) {
    return <PublicNav>{children}</PublicNav>;
  }

  // Protected admin/user area: sidebar + header + auth guard
  return (
    <AuthGuard>
      <SidebarProvider>
        <Sidebar />
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
