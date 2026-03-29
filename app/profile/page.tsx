"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Camera,
  User as UserIcon,
  Shield,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession, updateSessionUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { userApi } from "@/lib/api";

const roleColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  admin:   { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", dot: "#F59E0B" },
  manager: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE", dot: "#6366F1" },
  cashier: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", dot: "#22C55E" },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
  });
  const [picture, setPicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace("/login"); return; }
    setUser(session);
    setForm({
      name: session.name,
      mobile: session.mobile,
      email: session.email ?? "",
      address: session.address ?? "",
    });
  }, [router]);

  const getFormattedDate = () => {
    if (!user?.createdAt) return "N/A";
    return new Date(user.createdAt).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicture(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.name || !form.mobile) {
      toast.error("Name and mobile are required");
      return;
    }
    setSaving(true);
    try {
      if (user.id.startsWith("usr_")) {
        updateSessionUser({ ...form, email: form.email || undefined });
      } else {
        await userApi.update(user.id, {
          id: user.id,
          name: form.name,
          mobile: form.mobile,
          email: form.email || undefined,
          address: form.address,
          picture: picture ?? undefined,
        });
        updateSessionUser({ ...form, email: form.email || undefined });
      }
      setUser((prev) => prev ? { ...prev, ...form } : prev);
      toast.success("Profile updated successfully!");
      setEditing(false);
      setPicture(null);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const avatarSrc = preview ?? (user.id.startsWith("usr_") ? undefined : userApi.getPictureUrl(user.id));
  const roleStyle = roleColors[user.role] ?? { bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB", dot: "#9CA3AF" };

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        maxWidth: 1000,
        margin: "0 auto",
        padding: "32px 24px 64px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* ─── Main content: 2-column layout ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: editing ? "1fr" : "340px 1fr", gap: 24, alignItems: "start" }}>
        
        {/* LEFT: Avatar card + Quick info ────────────────────────────────── */}
        <div
          style={{
            borderRadius: 14,
            border: "2px solid #E0E7FF",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.08)",
          }}
        >
          {/* Gradient header banner */}
          <div
            style={{
              height: 80,
              background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: -40 }}>
              {/* Avatar with upload */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: "3px solid white",
                    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.25)",
                    overflow: "hidden",
                    background: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage src={avatarSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <AvatarFallback
                      style={{
                        background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                        color: "#FFFFFF",
                        fontSize: 24,
                        fontWeight: 700,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {editing && (
                  <label
                    htmlFor="picture-upload"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                      border: "2px solid white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                    }}
                    title="Change photo"
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.4)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(99, 102, 241, 0.3)";
                    }}
                  >
                    <Camera style={{ width: 14, height: 14, color: "#FFFFFF", strokeWidth: 1.5 }} />
                    <input
                      id="picture-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handlePicture}
                    />
                  </label>
                )}
              </div>

              {/* Name + role */}
              <div style={{ textAlign: "center" }}>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {user.name}
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontFamily: "monospace",
                    margin: "4px 0 8px",
                  }}
                >
                  @{user.username}
                </p>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    padding: "3px 9px",
                    borderRadius: 999,
                    background: roleStyle.bg,
                    color: roleStyle.text,
                    border: `1.5px solid ${roleStyle.border}`,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: roleStyle.dot,
                      flexShrink: 0,
                    }}
                  />
                  {user.role?.toUpperCase()}
                </span>
              </div>
            </div>

            {!editing && (
              <>
                {/* Quick stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: "#F0F9FF",
                      border: "1px solid #BAE6FD",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#0C4A6E", fontWeight: 600, textTransform: "uppercase" }}>Joined</div>
                    <div style={{ fontSize: 11, color: "#0369A1", fontWeight: 700, marginTop: 2 }}>{getFormattedDate()}</div>
                  </div>
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: "#FAF5FF",
                      border: "1px solid #E9D5FF",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#5B21B6", fontWeight: 600, textTransform: "uppercase" }}>Status</div>
                    <div style={{ fontSize: 11, color: "#7E22CE", fontWeight: 700, marginTop: 2 }}>Active</div>
                  </div>
                </div>

                {/* Edit button */}
                <button
                  onClick={() => { setEditing(true); }}
                  style={{
                    width: "100%",
                    marginTop: 14,
                    padding: "10px 16px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.3)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
                  }}
                >
                  ✎ Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Details / Edit form ──────────────────────────────────── */}
        <div
          style={{
            borderRadius: 14,
            border: "2px solid #E0E7FF",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.08)",
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1.5px solid #EDE9FE",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(90deg, #F8F7FF 0%, #FAF5FF 100%)",
            }}
          >
            <UserIcon style={{ width: 16, height: 16, color: "#6366F1", strokeWidth: 1.5 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827 " }}>
              {editing ? "Update Profile" : "Account Details"}
            </span>
          </div>

          <div style={{ padding: 24 }}>
            {editing ? (
              /* ── Edit mode ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* 2-column grid for better space usage */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 16,
                  }}
                >
                  {/* Full Name */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6366F1",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Full Name <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      style={{
                        height: 40,
                        fontSize: 14,
                        borderRadius: 10,
                      }}
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Mobile */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6366F1",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Mobile <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <Input
                      value={form.mobile}
                      onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                      style={{
                        height: 40,
                        fontSize: 14,
                        borderRadius: 10,
                      }}
                      placeholder="Enter mobile number"
                    />
                  </div>

                  {/* Email (spans 2 cols on single row for wider field) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6366F1",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Email
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      style={{
                        height: 40,
                        fontSize: 14,
                        borderRadius: 10,
                      }}
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Address (spans 2 cols for wider field) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6366F1",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Address
                    </label>
                    <Input
                      value={form.address}
                      onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      style={{
                        height: 40,
                        fontSize: 14,
                        borderRadius: 10,
                      }}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "flex-end",
                    paddingTop: 8,
                  }}
                >
                  <button
                    onClick={() => {
                      setEditing(false);
                      setPicture(null);
                      setPreview(null);
                      setForm({
                        name: user.name,
                        mobile: user.mobile,
                        email: user.email ?? "",
                        address: user.address ?? "",
                      });
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "rgba(255, 255, 255, 0.7)",
                      border: "1.5px solid #E5E7EB",
                      color: "#374151",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#F3F4F6";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.7)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 20px",
                      background: saving ? "#C7D2FE" : "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: saving ? "not-allowed" : "pointer",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                    }}
                    onMouseEnter={e => {
                      if (!saving) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.3)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!saving) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
                      }
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 style={{ width: 15, height: 15, strokeWidth: 1.5 }} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save style={{ width: 15, height: 15, strokeWidth: 1.5 }} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ── View mode: Info cards row ── */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                {[
                  { icon: Phone, label: "Mobile", value: user.mobile },
                  { icon: Mail, label: "Email", value: user.email ?? "—" },
                  { icon: MapPin, label: "Address", value: user.address || "—" },
                  { icon: Shield, label: "Role", value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1) },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #F8F7FF 0%, #FAF5FF 100%)",
                      border: "1.5px solid #E0E7FF",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.15)";
                      e.currentTarget.style.borderColor = "#C7D2FE";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#E0E7FF";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Icon style={{ width: 14, height: 14, color: "#6366F1", strokeWidth: 1.5, flexShrink: 0, marginTop: 2 }} />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#6366F1",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111827",
                        display: "block",
                        wordBreak: "break-word",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}