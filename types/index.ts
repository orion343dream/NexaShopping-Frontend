// ─── Student type (backend DTO) ────────────────────────────────────────────
export interface Student {
  nic: string;
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: string;
}

export interface StudentFormData {
  nic: string;
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: File | null;
}

// ─── POS User types ────────────────────────────────────────────────────────
export interface User {
  id: string;         // maps to user nic
  username?: string;  // stored in localStorage only
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: string;
  role?: "admin" | "user" | "cashier" | "manager";
  createdAt?: string;
}

export interface UserFormData {
  id: string;
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: File | null;
  role?: string;
}

// ─── Item types ────────────────────────────────────────────────────────────
export interface Item {
  itemId: string;
  name?: string;
  shortDescription?: string;
  description: string;
  price?: number;
  category?: string;
  stock?: number;
  images?: string[];
  createdAt?: string;
}

export interface ItemFormData {
  itemId: string;
  name?: string;
  shortDescription?: string;
  description: string;
  price?: number;
  category?: string;
  stock?: number;
  images?: string[];
}

// ─── Order status ──────────────────────────────────────────────────────────
export type OrderStatus = "pending" | "accepted" | "shipped" | "completed" | "cancelled" | "refunded";

// ─── Order types ───────────────────────────────────────────────────────────
export interface CustomerSummary {
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: string;
}

export interface Order {
  id?: number;
  date: string;
  userId: string;
  itemId: string;
  user?: CustomerSummary;
  status?: OrderStatus;
}

export interface OrderFormData {
  date: string;
  userId: string;
  itemId: string;
}

// API response wrapper
export interface ApiError {
  message: string;
  status?: number;
}
