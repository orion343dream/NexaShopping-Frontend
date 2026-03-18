"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Package, ExternalLink, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { itemApi } from "@/lib/api";
import type { Item } from "@/types";
import { ItemForm, type ItemFormValues } from "@/components/items/item-form";
import Link from "next/link";

const stockColor = (s?: number | null) => {
  if (s == null) return "bg-slate-100 text-slate-500";
  if (s === 0) return "bg-red-100 text-red-600";
  if (s <= 5) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
};

function ItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Item | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try { setItems((await itemApi.getAll()).reverse()); }
    catch { toast.error("Failed to load items"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (searchParams.get("action") === "new") { setEditTarget(undefined); setFormOpen(true); }
  }, [searchParams]);

  const filtered = items.filter((p) =>
    (p.name ?? p.description).toLowerCase().includes(search.toLowerCase()) ||
    p.itemId.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleFormSubmit = async (values: ItemFormValues) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await itemApi.update(editTarget.itemId, values);
        toast.success("Item updated");
      } else {
        await itemApi.create(values);
        toast.success("Item created");
      }
      setFormOpen(false);
      router.replace("/items");
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await itemApi.delete(deleteTarget.itemId);
      toast.success("Item deleted");
      setDeleteOpen(false);
      fetchItems();
    } catch { toast.error("Failed to delete item"); }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button
            onClick={() => { setEditTarget(undefined); setFormOpen(true); }}
            className="gap-2 bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0 shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    {search ? "No matching items" : "No items yet. Add one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.itemId} className="hover:bg-slate-50/60">
                    {/* Thumbnail */}
                    <TableCell>
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-slate-300" />
                        )}
                      </div>
                    </TableCell>
                    {/* Name */}
                    <TableCell>
                      <p className="font-semibold text-slate-900">{p.name || p.description}</p>
                      {p.shortDescription && (
                        <p className="text-xs text-slate-400 truncate max-w-[180px]">{p.shortDescription}</p>
                      )}
                    </TableCell>
                    {/* Code */}
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{p.itemId}</Badge>
                    </TableCell>
                    {/* Category */}
                    <TableCell>
                      {p.category ? (
                        <span className="inline-flex items-center gap-1 text-xs text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                          <Tag className="h-3 w-3" />{p.category}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </TableCell>
                    {/* Price */}
                    <TableCell>
                      {p.price != null ? (
                        <span className="font-semibold text-slate-900 text-sm">LKR {Number(p.price).toLocaleString()}</span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </TableCell>
                    {/* Stock */}
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stockColor(p.stock)}`}>
                        {p.stock != null ? (p.stock === 0 ? "Out" : p.stock) : "—"}
                      </span>
                    </TableCell>
                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/shop/${p.itemId}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View public page">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditTarget(p); setFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setDeleteTarget(p); setDeleteOpen(true); }}
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
        <p className="text-xs text-slate-400">{filtered.length} item{filtered.length !== 1 ? "s" : ""} shown</p>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && (setFormOpen(false), router.replace("/items"))}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <ItemForm
            item={editTarget}
            onSubmit={handleFormSubmit}
            onCancel={() => { setFormOpen(false); router.replace("/items"); }}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={(o) => !o && setDeleteOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.name || deleteTarget?.itemId}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function ItemsPage() {
  return <Suspense><ItemsContent /></Suspense>;
}
