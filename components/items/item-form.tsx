"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem as SelectMenuItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Item, ItemFormData } from "@/types";

export interface ItemFormValues {
  itemId: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number | undefined;
  category: string;
  stock: number | undefined;
  images: string[]; // base64
}

const CATEGORIES = [
  "Electronics", "Food & Beverage", "Clothing", "Health & Beauty",
  "Home & Garden", "Books & Stationery", "Sports", "Toys", "Other",
];

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  item?: Item;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function ItemForm({ item, onSubmit, onCancel, loading }: Props) {
  const isEdit = !!item;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ItemFormValues>({
    itemId: item?.itemId ?? "",
    name: item?.name ?? "",
    shortDescription: item?.shortDescription ?? "",
    description: item?.description ?? "",
    price: item?.price,
    category: item?.category ?? "",
    stock: item?.stock,
    images: item?.images ?? [],
  });
  const [imgLoading, setImgLoading] = useState(false);

  const set = <K extends keyof ItemFormValues>(k: K, v: ItemFormValues[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (form.images.length + files.length > 4) {
      alert("Maximum 4 images allowed.");
      return;
    }
    setImgLoading(true);
    const b64s = await Promise.all(Array.from(files).map(fileToBase64));
    set("images", [...form.images, ...b64s]);
    setImgLoading(false);
  };

  const removeImage = (i: number) =>
    set("images", form.images.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemId && !isEdit) { alert("Item ID is required"); return; }
    if (!form.description) { alert("Description is required"); return; }
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
      {/* Item ID (create only) */}
      {!isEdit && (
        <div className="space-y-1.5">
          <Label className="font-semibold text-slate-700">
            Item Code <span className="text-red-500">*</span>
            <span className="ml-1 text-[10px] text-slate-400 font-normal">(uppercase letters only, e.g. PHONE)</span>
          </Label>
          <Input
            value={form.itemId}
            onChange={(e) => set("itemId", e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
            placeholder="e.g. PHONE"
            className="h-10 font-mono"
            maxLength={20}
          />
        </div>
      )}

      {/* Name + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="font-semibold text-slate-700">Display Name</Label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Wireless Earbuds Pro"
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-semibold text-slate-700">Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectMenuItem key={c} value={c}>{c}</SelectMenuItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Short description */}
      <div className="space-y-1.5">
        <Label className="font-semibold text-slate-700">Short Tagline</Label>
        <Input
          value={form.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          placeholder="One-line product teaser shown on cards"
          className="h-10"
          maxLength={120}
        />
      </div>

      {/* Long description */}
      <div className="space-y-1.5">
        <Label className="font-semibold text-slate-700">
          Full Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Detailed description of the item…"
          className="min-h-[80px] resize-none"
          rows={3}
        />
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="font-semibold text-slate-700">Price (LKR)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="number"
              min={0}
              step={0.01}
              value={form.price ?? ""}
              onChange={(e) => set("price", e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
              className="h-10 pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="font-semibold text-slate-700">Stock Quantity</Label>
          <Input
            type="number"
            min={0}
            value={form.stock ?? ""}
            onChange={(e) => set("stock", e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="e.g. 100"
            className="h-10"
          />
        </div>
      </div>

      {/* Image upload */}
      <div className="space-y-2">
        <Label className="font-semibold text-slate-700">
          Product Images
          <span className="ml-1 text-[10px] text-slate-400 font-normal">(up to 4)</span>
        </Label>
        <div className="flex gap-2 flex-wrap">
          {form.images.map((src, i) => (
            <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {form.images.length < 4 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 transition-colors flex flex-col items-center justify-center text-slate-400 hover:text-violet-500"
            >
              {imgLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="h-5 w-5 mb-0.5" />
                  <span className="text-[10px] font-medium">Add</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleImages(e.target.files)}
        />
        <p className="text-[11px] text-slate-400">Images are stored as base64. Recommended: square, under 500KB each.</p>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-amber-500 to-violet-600 text-white border-0 hover:from-amber-600 hover:to-violet-700"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Item"}
        </Button>
      </div>
    </form>
  );
}

// Backward compat
export { ItemFormValues as ProgramFormValues };
export { ItemForm as ProgramForm };
