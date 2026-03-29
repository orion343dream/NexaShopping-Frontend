"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  Search,
  Download,
  Filter,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  User,
  ShoppingCart,
  FileText,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SystemLog {
  id: string;
  timestamp: Date;
  type: "api" | "user_action" | "order" | "error" | "system";
  action: string;
  status: "success" | "pending" | "error" | "warning";
  details: string;
  user?: string;
  metadata?: Record<string, any>;
}

// Mock real system data
const generateMockLogs = (): SystemLog[] => {
  const now = new Date();
  return [
    {
      id: "log-1",
      timestamp: new Date(now.getTime() - 2 * 60000),
      type: "user_action",
      action: "Profile Updated",
      status: "success",
      details: "User updated profile information",
      user: "admin",
      metadata: { fields: ["name", "mobile"] },
    },
    {
      id: "log-2",
      timestamp: new Date(now.getTime() - 5 * 60000),
      type: "order",
      action: "Order Created",
      status: "success",
      details: "New order placed - Order #12345",
      user: "user_001",
      metadata: { orderId: "12345", total: 5200 },
    },
    {
      id: "log-3",
      timestamp: new Date(now.getTime() - 8 * 60000),
      type: "api",
      action: "GET /api/v1/items",
      status: "success",
      details: "API request completed successfully",
      user: "user_002",
      metadata: { responseTime: "245ms", count: 48 },
    },
    {
      id: "log-4",
      timestamp: new Date(now.getTime() - 12 * 60000),
      type: "error",
      action: "Database Connection Failed",
      status: "error",
      details: "Connection timeout on user fetch operation",
      metadata: { endpoint: "/api/v1/users", retry: 3 },
    },
    {
      id: "log-5",
      timestamp: new Date(now.getTime() - 15 * 60000),
      type: "system",
      action: "Cache Cleared",
      status: "success",
      details: "Application cache refreshed",
      metadata: { size: "2.3 MB" },
    },
    {
      id: "log-6",
      timestamp: new Date(now.getTime() - 20 * 60000),
      type: "user_action",
      action: "Item Added",
      status: "success",
      details: "New item created - Electronics category",
      user: "admin",
      metadata: { itemId: "ITEM_2024_001", price: 5999 },
    },
    {
      id: "log-7",
      timestamp: new Date(now.getTime() - 25 * 60000),
      type: "order",
      action: "Order Status Changed",
      status: "success",
      details: "Order status updated to shipped",
      user: "admin",
      metadata: { orderId: "12340", status: "shipped" },
    },
    {
      id: "log-8",
      timestamp: new Date(now.getTime() - 30 * 60000),
      type: "api",
      action: "POST /api/v1/orders",
      status: "success",
      details: "Order creation API executed",
      metadata: { statusCode: 201, duration: "156ms" },
    },
    {
      id: "log-9",
      timestamp: new Date(now.getTime() - 35 * 60000),
      type: "warning",
      action: "High Memory Usage",
      status: "warning",
      details: "Memory usage exceeded 80% threshold",
      metadata: { usage: "82%", threshold: "80%" },
    },
    {
      id: "log-10",
      timestamp: new Date(now.getTime() - 45 * 60000),
      type: "system",
      action: "Backup Started",
      status: "pending",
      details: "Database backup process initiated",
      metadata: { size: "150 MB", estimated: "45s" },
    },
  ];
};

const typeIcons: Record<string, React.ReactNode> = {
  api: <Zap className="w-4 h-4" />,
  user_action: <User className="w-4 h-4" />,
  order: <ShoppingCart className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  system: <Settings className="w-4 h-4" />,
};

const typeColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  api: { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD", badge: "#0EA5E9" },
  user_action: { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE", badge: "#A78BFA" },
  order: { bg: "#F0FDF4", text: "#166534", border: "#86EFAC", badge: "#22C55E" },
  error: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", badge: "#EF4444" },
  system: { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A", badge: "#F59E0B" },
};

const statusIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-green-600" />,
  error: <AlertCircle className="w-4 h-4 text-red-600" />,
  warning: <AlertCircle className="w-4 h-4 text-yellow-600" />,
  pending: <Clock className="w-4 h-4 text-blue-600" />,
};

export default function SystemMonitorPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      router.replace("/");
      return;
    }
    setLogs(generateMockLogs());
  }, [router]);

  useEffect(() => {
    let filtered = logs;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower) ||
          log.user?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedType) {
      filtered = filtered.filter((log) => log.type === selectedType);
    }

    if (selectedStatus) {
      filtered = filtered.filter((log) => log.status === selectedStatus);
    }

    setFilteredLogs(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, [logs, search, selectedType, selectedStatus]);

  const handleExport = (format: "csv" | "json") => {
    const data = filteredLogs.map((log) => ({
      timestamp: log.timestamp.toISOString(),
      type: log.type,
      action: log.action,
      status: log.status,
      details: log.details,
      user: log.user || "system",
    }));

    let content = "";
    let filename = `system-logs-${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      const headers = ["Timestamp", "Type", "Action", "Status", "Details", "User"];
      content =
        headers.join(",") +
        "\n" +
        data.map((d) => `"${d.timestamp}","${d.type}","${d.action}","${d.status}","${d.details}","${d.user}"`).join("\n");
      filename += ".csv";
    } else {
      content = JSON.stringify(data, null, 2);
      filename += ".json";
    }

    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Activity style={{ width: 32, height: 32, color: "#6366F1" }} />
            System Monitor
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Real-time application logs, activities, and system processes
          </p>
        </div>

        {/* ── Controls ──────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            marginBottom: 24,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
            {/* Search */}
            <div>
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: 40,
                  fontSize: 14,
                  borderRadius: 10,
                  paddingLeft: 40,
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "12px center",
                }}
              />
            </div>

            {/* Type filter */}
            <div style={{ position: "relative" }}>
              <select
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value || null)}
                style={{
                  width: "100%",
                  height: 40,
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 10,
                  border: "2px solid #E0E7FF",
                  background: selectedType ? "#F0F9FF" : "white",
                  color: "#6B7280",
                  padding: "8px 12px",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236366F1" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  paddingRight: 32,
                }}
              >
                <option value="">All Types</option>
                <option value="api">API Calls</option>
                <option value="user_action">User Actions</option>
                <option value="order">Orders</option>
                <option value="error">Errors</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Status filter */}
            <div style={{ position: "relative" }}>
              <select
                value={selectedStatus || ""}
                onChange={(e) => setSelectedStatus(e.target.value || null)}
                style={{
                  width: "100%",
                  height: 40,
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 10,
                  border: "2px solid #E0E7FF",
                  background: selectedStatus ? "#F0F9FF" : "white",
                  color: "#6B7280",
                  padding: "8px 12px",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236366F1" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  paddingRight: 32,
                }}
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Clear filters */}
            {(search || selectedType || selectedStatus) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedType(null);
                  setSelectedStatus(null);
                }}
                style={{
                  padding: "8px 12px",
                  background: "#FFFFFF",
                  border: "2px solid #FEE2E2",
                  borderRadius: 10,
                  color: "#DC2626",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FEE2E2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FFFFFF";
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Export buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => handleExport("csv")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(99, 102, 241, 0.2)";
              }}
            >
              <Download style={{ width: 14, height: 14 }} />
              CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "rgba(255, 255, 255, 0.8)",
                border: "2px solid #E0E7FF",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                color: "#6366F1",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F0F9FF";
                e.currentTarget.style.borderColor = "#BAE6FD";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                e.currentTarget.style.borderColor = "#E0E7FF";
              }}
            >
              <Download style={{ width: 14, height: 14 }} />
              JSON
            </button>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Logs", value: logs.length, color: "#6366F1" },
            { label: "Success Rate", value: `${Math.round((logs.filter((l) => l.status === "success").length / logs.length) * 100)}%`, color: "#22C55E" },
            { label: "Errors", value: logs.filter((l) => l.status === "error").length, color: "#EF4444" },
            { label: "Warnings", value: logs.filter((l) => l.status === "warning").length, color: "#F59E0B" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: 14,
                borderRadius: 10,
                border: "2px solid #E0E7FF",
                background: "linear-gradient(135deg, #F8F7FF 0%, #FAF5FF 100%)",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#C7D2FE";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E0E7FF";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: 6 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Timeline ──────────────────────────────────────────────────────── */}
        <div
          style={{
            borderRadius: 12,
            border: "2px solid #E0E7FF",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.08)",
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <Activity style={{ width: 40, height: 40, color: "#D1D5DB", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
                {search || selectedType || selectedStatus ? "No logs match your filters" : "No logs found"}
              </p>
            </div>
          ) : (
            <div>
              {filteredLogs.map((log, idx) => {
                const color = typeColors[log.type] || typeColors.system;
                return (
                  <div
                    key={log.id}
                    style={{
                      padding: "16px 20px",
                      borderBottom: idx !== filteredLogs.length - 1 ? "1px solid #F3F4F6" : "none",
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto auto",
                      gap: 16,
                      alignItems: "center",
                      transition: "all 0.3s ease",
                      background: idx % 2 === 0 ? "transparent" : "linear-gradient(90deg, #F8F7FF 0%, transparent 100%)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(90deg, #F0F9FF 0%, transparent 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "linear-gradient(90deg, #F8F7FF 0%, transparent 100%)";
                    }}
                  >
                    {/* Status icon */}
                    <div>{statusIcons[log.status]}</div>

                    {/* Main content */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: color.bg,
                            border: `1px solid ${color.border}`,
                          }}
                        >
                          <div style={{ color: color.badge }}>{typeIcons[log.type]}</div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: color.text, textTransform: "capitalize" }}>
                            {log.type.replace("_", " ")}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                            margin: 0,
                          }}
                        >
                          {log.action}
                        </h3>
                      </div>
                      <p style={{ fontSize: 12, color: "#6B7280", margin: 0, marginBottom: 4 }}>
                        {log.details}
                      </p>
                      {log.user && (
                        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                          by <strong>{log.user}</strong>
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ textAlign: "right", fontSize: 12, color: "#9CA3AF" }}>
                      <div style={{ fontWeight: 600 }}>
                        {log.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div>
                        {log.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>

                    {/* Details toggle */}
                    {log.metadata && (
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: 6,
                          color: "#6366F1",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#EEF2FF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                        title="View details"
                      >
                        <ChevronDown style={{ width: 18, height: 18 }} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer info ────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 24, fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>
          Showing {filteredLogs.length} of {logs.length} logs • Auto-refreshes in real-time
        </div>
      </div>
    </div>
  );
}
