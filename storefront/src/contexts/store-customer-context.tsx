"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  STORE_TOKEN_CHANGED_EVENT,
  getStoreTokenFromBrowser,
  setStoreTokenInBrowser,
} from "@/lib/store-token";
import { isStandaloneStore } from "@/lib/store-mode";

export type StoreCustomerProfile = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
};

type StoreCustomerContextValue = {
  customer: StoreCustomerProfile | null;
  token: string | null;
  loading: boolean;
  setSessionFromToken: (token: string) => Promise<void>;
  login: (phone: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (data: {
    name: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const StoreCustomerContext = createContext<StoreCustomerContextValue | null>(null);

async function fetchMe(token: string): Promise<StoreCustomerProfile | null> {
  const res = await fetch("/api/store/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { ok?: boolean; customer?: StoreCustomerProfile };
  if (!data.ok || !data.customer) return null;
  return data.customer;
}

export function StoreCustomerProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<StoreCustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    if (isStandaloneStore()) {
      setToken(null);
      setCustomer(null);
      setLoading(false);
      return;
    }
    const t = getStoreTokenFromBrowser();
    setToken(t);
    if (!t) {
      setCustomer(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const c = await fetchMe(t);
    if (!c) {
      setStoreTokenInBrowser(null);
      setToken(null);
      setCustomer(null);
    } else {
      setCustomer(c);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    const onChange = () => {
      void refreshMe();
    };
    window.addEventListener(STORE_TOKEN_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(STORE_TOKEN_CHANGED_EVENT, onChange);
  }, [refreshMe]);

  const setSessionFromToken = useCallback(async (newToken: string) => {
    setStoreTokenInBrowser(newToken);
    setToken(newToken);
    setLoading(true);
    const c = await fetchMe(newToken);
    if (!c) {
      setStoreTokenInBrowser(null);
      setToken(null);
      setCustomer(null);
    } else {
      setCustomer(c);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (phone: string, password: string) => {
      if (isStandaloneStore()) {
        return { ok: false, message: "تسجيل الدخول غير متاح في النسخة المستقلة." };
      }
      const res = await fetch("/api/store/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        token?: string;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.token) {
        return { ok: false, message: data.message || "تعذر تسجيل الدخول." };
      }
      await setSessionFromToken(data.token);
      return { ok: true };
    },
    [setSessionFromToken],
  );

  const register = useCallback(
    async (payload: {
      name: string;
      phone: string;
      password: string;
      password_confirmation: string;
    }) => {
      if (isStandaloneStore()) {
        return { ok: false, message: "التسجيل غير متاح في النسخة المستقلة." };
      }
      const res = await fetch("/api/store/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        token?: string;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.token) {
        return { ok: false, message: data.message || "تعذر إنشاء الحساب." };
      }
      await setSessionFromToken(data.token);
      return { ok: true };
    },
    [setSessionFromToken],
  );

  const logout = useCallback(async () => {
    const t = getStoreTokenFromBrowser();
    if (t) {
      await fetch("/api/store/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
    }
    setStoreTokenInBrowser(null);
    setToken(null);
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({
      customer,
      token,
      loading,
      setSessionFromToken,
      login,
      register,
      logout,
      refreshMe,
    }),
    [customer, token, loading, setSessionFromToken, login, register, logout, refreshMe],
  );

  return (
    <StoreCustomerContext.Provider value={value}>{children}</StoreCustomerContext.Provider>
  );
}

export function useStoreCustomer() {
  const ctx = useContext(StoreCustomerContext);
  if (!ctx) {
    throw new Error("يجب استخدام useStoreCustomer داخل StoreCustomerProvider");
  }
  return ctx;
}
