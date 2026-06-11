import { create } from "zustand";
import api from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  job_title: string;
  is_admin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const { data } = await api.post("/admin/auth/login", { email, password });
    localStorage.setItem("alatraqchy-token", data.token);
    localStorage.setItem("alatraqchy-user", JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
  },

  logout: async () => {
    try {
      await api.post("/admin/auth/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("alatraqchy-token");
    localStorage.removeItem("alatraqchy-user");
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get("/admin/auth/me");
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, token: null, loading: false });
    }
  },

  initialize: () => {
    const token = localStorage.getItem("alatraqchy-token");
    const user = localStorage.getItem("alatraqchy-user");
    if (token && user) {
      set({ token, user: JSON.parse(user), loading: false });
    } else {
      set({ loading: false });
    }
  },
}));
