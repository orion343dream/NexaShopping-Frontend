"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, Eye, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userApi } from "@/lib/api";
import type { User } from "@/types";
import { getRegisteredUsers, saveRegisteredUsers } from "@/lib/auth";

const roleVariant: Record<string, string> = {
  admin:   "bg-amber-100 text-amber-700 border-amber-200",
  user:    "bg-violet-100 text-violet-700 border-violet-200",
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewTarget, setViewTarget] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // Merge API users with localStorage registered user data
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const apiUsers = await userApi.getAll();
      const localUsers = getRegisteredUsers();
      // Enrich with local metadata (username, role)
      const enriched = apiUsers.map((u) => {
        const local = localUsers.find((l) => l.id === u.id);
        return local
          ? { ...u, username: local.username, role: local.role }
          : u;
      });
      // Also add registered users that may not be in the API yet
      const apiIds = new Set(apiUsers.map((u) => u.id));
      const localOnly = localUsers
        .filter((l) => !apiIds.has(l.id))
        .map((l) => ({
          id: l.id,
          username: l.username,
          name: l.name,
          mobile: l.mobile,
          email: l.email,
          address: l.address,
          role: l.role,
          createdAt: l.createdAt,
        } as User));
      setUsers([...enriched, ...localOnly]);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search)
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;

    // 1. Try to delete from backend API (might fail if user is local-only)
    try {
      await userApi.delete(deleteTarget.id);
    } catch {
      console.warn("API delete failed or user not in backend. Proceeding with local delete.");
    }

    // 2. Always delete from localStorage
    try {
      const localUsers = getRegisteredUsers();
      const updatedLocal = localUsers.filter((u) => u.id !== deleteTarget.id);
      saveRegisteredUsers(updatedLocal);
      
      toast.success("User deleted");
      setDeleteOpen(false);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user locally");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search by name, username or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-slate-500">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  {search ? "No matching users found" : "No users yet. Register one!"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/60">
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={userApi.getPictureUrl(user.id)}
                        alt={user.name}
                      />
                      <AvatarFallback
                        className="text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#f59e0b,#7c3aed)" }}
                      >
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[140px]">
                      {user.address || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-slate-600">
                      @{user.username ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold border ${roleVariant[user.role ?? "cashier"] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {user.role ?? "cashier"}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600">{user.mobile}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {user.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewTarget(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setDeleteTarget(user);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-20 w-20 ring-2 ring-amber-300">
                  <AvatarImage src={userApi.getPictureUrl(viewTarget.id)} />
                  <AvatarFallback
                    className="text-2xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#7c3aed)" }}
                  >
                    {initials(viewTarget.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-900">{viewTarget.name}</h3>
                  <p className="text-sm text-slate-500 font-mono">@{viewTarget.username ?? "—"}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold border mt-1 inline-block ${roleVariant[viewTarget.role ?? "cashier"]}`}
                  >
                    {viewTarget.role ?? "cashier"}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Mobile", value: viewTarget.mobile },
                  { label: "Email", value: viewTarget.email ?? "—" },
                  { label: "Address", value: viewTarget.address || "—" },
                  { label: "Member Since", value: viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleDateString() : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-right max-w-[180px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={(o) => !o && setDeleteOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
