// NexaShopping – Frontend Auth Helpers (localStorage-based)

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  address: string;
  mobile: string;
  email?: string;
  role: "admin" | "user" | "cashier" | "manager";
  createdAt: string;
}

export interface RegisteredUser extends SessionUser {
  passwordHash: string;
}

const SESSION_KEY = "nexashopping_session";
const USERS_KEY = "nexashopping_users";

// Old keys for migration
const OLD_SESSION_KEY = "nexabill_session";
const OLD_USERS_KEY = "nexabill_users";

/**
 * Migrate data from old nexabill keys to new nexashopping keys.
 * Runs on every init — merging is cheap and ensures no users are lost.
 */
export function migrateFromOldKeys(): void {
  if (typeof window === "undefined") return;

  try {
    // Always merge old users into new key (idempotent)
    const oldUsers = localStorage.getItem(OLD_USERS_KEY);
    if (oldUsers) {
      const oldArr = JSON.parse(oldUsers) as RegisteredUser[];
      const newArr = (() => {
        try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as RegisteredUser[]; }
        catch { return []; }
      })();
      const merged = [...newArr];
      for (const oldUser of oldArr) {
        if (!merged.find((u) => u.username === oldUser.username)) {
          merged.push(oldUser);
        }
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(merged));
    }

    // Migrate session if needed
    const oldSession = localStorage.getItem(OLD_SESSION_KEY);
    if (oldSession && !localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, oldSession);
    }
  } catch (e) {
    console.warn("Migration failed:", e);
  }
}

// ── Admin seed (hardcoded) ──────────────────────────────────────────────────
const ADMIN_USER: RegisteredUser = {
  id: "admin",
  username: "admin",
  passwordHash: btoa("admin123"), // hash: admin123
  name: "Administrator",
  address: "NexaShopping HQ",
  mobile: "0700000000",
  email: "admin@nexashopping.com",
  role: "admin",
  createdAt: "2024-01-01T00:00:00.000Z",
};

/**
 * Ensure the admin account always exists in localStorage.
 * Call once on app startup (in layout-shell or layout.tsx).
 */
export function initializeAdmin(): void {
  if (typeof window === "undefined") return;

  // First, migrate old data if needed
  migrateFromOldKeys();

  const users = getRegisteredUsers();
  if (!users.find((u) => u.username === "admin")) {
    saveRegisteredUsers([ADMIN_USER, ...users]);
  }
}

// ── Session ─────────────────────────────────────────────────────────────────

export function saveSession(user: SessionUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function isAdmin(): boolean {
  return getSession()?.role === "admin";
}

// ── Users Registry ──────────────────────────────────────────────────────────

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as RegisteredUser[]) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(users: RegisteredUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(data: {
  username: string;
  password: string;
  name: string;
  mobile: string;
  email: string;
  address?: string;
}): { success: boolean; error?: string; user?: SessionUser } {
  const users = getRegisteredUsers();

  if (users.find((u) => u.username === data.username)) {
    return { success: false, error: "Username already taken" };
  }

  if (users.find((u) => u.email === data.email)) {
    return { success: false, error: "Email already registered" };
  }

  const newUser: RegisteredUser = {
    id: data.username,           // use username as backend-compatible ID
    username: data.username,
    passwordHash: btoa(data.password),
    name: data.name,
    mobile: data.mobile,
    email: data.email,
    address: data.address ?? "",
    role: "user",           // regular users always get "user" role
    createdAt: new Date().toISOString(),
  };

  saveRegisteredUsers([...users, newUser]);
  const { passwordHash: _, ...session } = newUser;
  return { success: true, user: session };
}

export function loginUser(
  emailOrUsername: string,
  password: string
): { success: boolean; error?: string; user?: SessionUser } {
  const users = getRegisteredUsers();
  const hash = btoa(password);
  // Match by email first, then fall back to username
  const found = users.find(
    (u) => (u.email === emailOrUsername || u.username === emailOrUsername) && u.passwordHash === hash
  );

  if (!found) {
    return { success: false, error: "Invalid email or password" };
  }

  const { passwordHash: _, ...session } = found;
  return { success: true, user: session };
}

export function updateSessionUser(updates: Partial<SessionUser>): void {
  const current = getSession();
  if (!current) return;
  const updated = { ...current, ...updates };
  saveSession(updated);

  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.id === current.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    saveRegisteredUsers(users);
  }
}
