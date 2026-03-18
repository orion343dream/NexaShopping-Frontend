import axios from "axios";
import type {
  Student,
  StudentFormData,
  Item,
  ItemFormData,
  Order,
  OrderFormData,
  User,
  UserFormData,
} from "@/types";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:7000";

const api = axios.create({
  baseURL: API_GATEWAY,
  headers: { "Content-Type": "application/json" },
});

// ─── Student API (raw backend DTO — kept for internal mapping) ──────────────

export const studentApi = {
  getAll: async (): Promise<Student[]> => {
    const { data } = await api.get("/api/v1/users");
    return data;
  },

  getById: async (nic: string): Promise<Student> => {
    const { data } = await api.get(`/api/v1/users/${nic}`);
    return data;
  },

  create: async (formData: StudentFormData): Promise<Student> => {
    const form = new FormData();
    form.append("nic", formData.nic);
    form.append("name", formData.name);
    form.append("address", formData.address);
    form.append("mobile", formData.mobile);
    if (formData.email) form.append("email", formData.email);
    if (formData.picture) form.append("picture", formData.picture);

    const { data } = await api.post("/api/v1/users", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (nic: string, formData: StudentFormData): Promise<Student> => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("address", formData.address);
    form.append("mobile", formData.mobile);
    if (formData.email) form.append("email", formData.email);
    if (formData.picture) form.append("picture", formData.picture);

    const { data } = await api.put(`/api/v1/users/${nic}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (nic: string): Promise<void> => {
    await api.delete(`/api/v1/users/${nic}`);
  },

  getPictureUrl: (nic: string): string =>
    `${API_GATEWAY}/api/v1/users/${nic}/picture`,
};

// ─── Item API ───────────────────────────────────────────────────────────────

export const itemApi = {
  getAll: async (): Promise<Item[]> => {
    const { data } = await api.get("/api/v1/items");
    return data;
  },

  getById: async (itemId: string): Promise<Item> => {
    const { data } = await api.get(`/api/v1/items/${itemId}`);
    return data;
  },

  create: async (body: ItemFormData): Promise<Item> => {
    const payload = {
      itemId: body.itemId,
      name: body.name ?? null,
      shortDescription: body.shortDescription ?? null,
      description: body.description,
      price: body.price ?? null,
      category: body.category ?? null,
      stock: body.stock ?? null,
      images: body.images ?? [],
      createdAt: new Date().toISOString(),
    };
    const { data } = await api.post("/api/v1/items", payload);
    return data;
  },

  update: async (itemId: string, body: ItemFormData): Promise<Item> => {
    const payload = {
      name: body.name ?? null,
      shortDescription: body.shortDescription ?? null,
      description: body.description,
      price: body.price ?? null,
      category: body.category ?? null,
      stock: body.stock ?? null,
      images: body.images ?? [],
    };
    const { data } = await api.put(`/api/v1/items/${itemId}`, payload);
    return data;
  },

  delete: async (itemId: string): Promise<void> => {
    await api.delete(`/api/v1/items/${itemId}`);
  },
};

// ─── Order API ──────────────────────────────────────────────────────────────

export const orderApi = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await api.get("/api/v1/orders");
    return data;
  },

  getById: async (id: number): Promise<Order> => {
    const { data } = await api.get(`/api/v1/orders/${id}`);
    return data;
  },

  getByItem: async (itemId: string): Promise<Order[]> => {
    const { data } = await api.get("/api/v1/orders", {
      params: { itemId },
    });
    return data;
  },

  create: async (body: OrderFormData): Promise<Order> => {
    const { data } = await api.post("/api/v1/orders", body);
    return data;
  },

  update: async (id: number, body: OrderFormData): Promise<Order> => {
    const { data } = await api.put(`/api/v1/orders/${id}`, body);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/orders/${id}`);
  },
};

// ─── User API (wraps user-service as POS users) ────────────────────────────

export function mapStudentToUser(s: Student & { username?: string; role?: string; createdAt?: string }): User {
  return {
    id: s.nic,
    username: s.username,
    name: s.name,
    address: s.address,
    mobile: s.mobile,
    email: s.email,
    picture: s.picture,
    role: (s.role ?? "cashier") as User["role"],
    createdAt: s.createdAt,
  };
}

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get("/api/v1/users");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(mapStudentToUser);
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get(`/api/v1/users/${id}`);
    return mapStudentToUser(data);
  },

  update: async (id: string, formData: UserFormData): Promise<User> => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("address", formData.address);
    form.append("mobile", formData.mobile);
    if (formData.email) form.append("email", formData.email);
    if (formData.picture) form.append("picture", formData.picture);
    const { data } = await api.put(`/api/v1/users/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapStudentToUser(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/users/${id}`);
  },

  getPictureUrl: (id: string): string =>
    `${API_GATEWAY}/api/v1/users/${id}/picture`,
};
