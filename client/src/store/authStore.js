import { create } from "zustand";

const API_URL = "http://localhost:5001/api/auth";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") return null;
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // ✅ update user instantly
  setUser: (newUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    set({ user: newUser });
  },

  // LOGIN
  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      set({ user: result.user, token: result.token, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // REGISTER
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      set({ user: result.user, token: result.token, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // LOGOUT
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  // CHECK AUTH
  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      localStorage.setItem("user", JSON.stringify(result.user));
      set({ user: result.user, token });
    } catch (err) {
      console.error("Auth check failed:", err);
      set({ user: null, token: null });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
}));
