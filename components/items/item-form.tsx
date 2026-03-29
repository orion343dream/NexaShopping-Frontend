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

  const fieldLabel = (text: string, required?: boolean, hint?: string) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {text}
        {required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
      </label>
      {hint && (
        <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 400 }}>{hint}</span>
      )}
    </div>
  );

  const inputStyle: React.CSSProperties = {
    height: 40,
    fontSize: 13,
    borderRadius: 8,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    width: "100%",
    padding: "0 12px",
    color: "#111827",
    outline: "none",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
    boxSizing: "border-box",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxHeight: "75vh",
        overflowY: "auto",
        paddingRight: 4,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Item ID (create only) */}
      {!isEdit && (
        <div>
          {fieldLabel("Item Code", true, "uppercase letters only, e.g. PHONE")}
          <Input
            value={form.itemId}
            onChange={(e) => set("itemId", e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
            placeholder="e.g. PHONE"
            maxLength={20}
            style={{ ...inputStyle, fontFamily: "monospace" }}
          />
        </div>
      )}

      {/* Name + Category */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div>
          {fieldLabel("Display Name")}
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Wireless Earbuds Pro"
            style={inputStyle}
          />
        </div>
        <div>
          {fieldLabel("Category")}
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger
              style={{
                height: 40,
                fontSize: 13,
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
              }}
            >
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
      <div>
        {fieldLabel("Short Tagline")}
        <Input
          value={form.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          placeholder="One-line product teaser shown on cards"
          maxLength={120}
          style={inputStyle}
        />
      </div>

      {/* Long description */}
      <div>
        {fieldLabel("Full Description", true)}
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Detailed description of the item…"
          rows={3}
          style={{
            fontSize: 13,
            borderRadius: 8,
            border: "1px solid #E5E7EB",
            background: "#FFFFFF",
            resize: "none",
            minHeight: 80,
            padding: "10px 12px",
            color: "#111827",
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Price + Stock */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          {fieldLabel("Price (LKR)")}
          <div style={{ position: "relative" }}>
            <DollarSign
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 14,
                color: "#9CA3AF",
                strokeWidth: 1.5,
                pointerEvents: "none",
              }}
            />
            <Input
              type="number"
              min={0}
              step={0.01}
              value={form.price ?? ""}
              onChange={(e) => set("price", e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
              style={{ ...inputStyle, paddingLeft: 32 }}
            />
          </div>
        </div>
        <div>
          {fieldLabel("Stock Quantity")}
          <Input
            type="number"
            min={0}
            value={form.stock ?? ""}
            onChange={(e) => set("stock", e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="e.g. 100"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Image upload */}
      <div>
        {fieldLabel("Product Images", false, "up to 4")}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {form.images.map((src, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                width: 76,
                height: 76,
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #E5E7EB",
              }}
              className="group"
            >
              <img
                src={src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.52)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  opacity: 0,
                  transition: "opacity 0.18s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
              >
                <X style={{ width: 16, height: 16, strokeWidth: 1.5 }} />
              </button>
            </div>
          ))}

          {form.images.length < 4 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                width: 76,
                height: 76,
                borderRadius: 10,
                border: "1.5px dashed #D1D5DB",
                background: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#9CA3AF",
                gap: 3,
                transition: "border-color 0.18s ease, color 0.18s ease, background 0.18s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366F1";
                (e.currentTarget as HTMLButtonElement).style.color = "#6366F1";
                (e.currentTarget as HTMLButtonElement).style.background = "#EEF2FF";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#D1D5DB";
                (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
                (e.currentTarget as HTMLButtonElement).style.background = "none";
              }}
            >
              {imgLoading ? (
                <Loader2 style={{ width: 18, height: 18, strokeWidth: 1.5 }} className="animate-spin" />
              ) : (
                <>
                  <ImagePlus style={{ width: 18, height: 18, strokeWidth: 1.5 }} />
                  <span style={{ fontSize: 10, fontWeight: 600 }}>Add</span>
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
          style={{ display: "none" }}
          onChange={(e) => handleImages(e.target.files)}
        />
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
          Images are stored as base64. Recommended: square, under 500 KB each.
        </p>
      </div>

      {/* Footer buttons */}
      <div
        style={{
          display: "flex",
          gap: 10,
          paddingTop: 16,
          borderTop: "1px solid #F3F4F6",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            height: 40,
            fontSize: 13,
            fontWeight: 600,
            background: "#FFFFFF",
            color: "#374151",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            cursor: "pointer",
            transition: "background 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#F3F4F6")}
          onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            height: 40,
            fontSize: 13,
            fontWeight: 600,
            background: loading ? "#A5B4FC" : "#6366F1",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 0.18s ease, transform 0.18s ease",
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#4F46E5"; }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#6366F1"; }}
          onMouseDown={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          {loading && <Loader2 style={{ width: 14, height: 14, strokeWidth: 1.5 }} className="animate-spin" />}
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Item"}
        </button>
      </div>
    </form>
  );
}

// Backward compat
export type { ItemFormValues as ProgramFormValues };
export { ItemForm as ProgramForm };