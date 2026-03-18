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

const roleColors: Record<string, string> = {
  admin: "bg-amber-100 text-amber-700 border-amber-200",
  manager: "bg-violet-100 text-violet-700 border-violet-200",
  cashier: "bg-emerald-100 text-emerald-700 border-emerald-200",
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
      // Update API if user has an API-side record
      if (user.id.startsWith("usr_")) {
        // Local-only user – update localStorage only
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Gradient banner */}
        <div
          className="h-28 w-full"
          style={{ background: "linear-gradient(135deg,#f59e0b 0%,#7c3aed 100%)" }}
        />
        <CardContent className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback
                  className="text-3xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#7c3aed)" }}
                >
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <label
                  htmlFor="picture-upload"
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center cursor-pointer shadow-md transition-colors"
                  title="Change photo"
                >
                  <Camera className="h-3.5 w-3.5 text-white" />
                  <input
                    id="picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePicture}
                  />
                </label>
              )}
            </div>

            {/* Name + role */}
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-sm text-slate-500 font-mono">@{user.username}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold border mt-1 inline-block ${roleColors[user.role] ?? "bg-slate-100 text-slate-600"}`}
              >
                {user.role}
              </span>
            </div>

            <Button
              variant={editing ? "outline" : "default"}
              onClick={() => { setEditing((v) => !v); if (editing) { setPicture(null); setPreview(null); } }}
              className={editing ? "" : "bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0"}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details / Edit */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-amber-500" />
            {editing ? "Edit Details" : "Profile Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            /* Edit mode */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-medium">Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-medium">Mobile *</Label>
                  <Input
                    value={form.mobile}
                    onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-medium">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-medium">Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    className="h-10"
                  />
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0 w-full sm:w-auto"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </>
          ) : (
            /* View mode */
            <div className="space-y-3 text-sm">
              {[
                { icon: Phone, label: "Mobile", value: user.mobile },
                { icon: Mail, label: "Email", value: user.email ?? "Not provided" },
                { icon: MapPin, label: "Address", value: user.address || "Not provided" },
                { icon: Shield, label: "Role", value: user.role },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <Icon className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-slate-500 w-20">{label}</span>
                  <span className="font-medium text-slate-800 capitalize">{value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
