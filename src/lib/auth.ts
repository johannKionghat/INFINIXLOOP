export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  avatar?: string;
}

const DEMO_ADMIN: User = {
  id: "1",
  email: "admin@infinixloop.io",
  name: "Admin",
  role: "admin",
};

const DEMO_USERS: { email: string; password: string; user: User }[] = [
  { email: "admin@infinixloop.io", password: "admin123", user: DEMO_ADMIN },
];

const STORAGE_KEY = "infinixloop_session";

export function login(email: string, password: string): User | null {
  const match = DEMO_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!match) return null;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match.user));
  }
  return match.user;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
