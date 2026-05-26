"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartState = Record<string, number>;

type CartContextValue = {
  items: CartState;
  totalItems: number;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  setItem: (id: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "alatraqji-cart-v1";
const CartContext = createContext<CartContextValue | undefined>(undefined);

const safeParse = (value: string | null): CartState => {
  if (!value) {
    return {};
  }
  try {
    const parsed = JSON.parse(value) as CartState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartState>({});

  useEffect(() => {
    setItems(safeParse(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (id: string) => {
    setItems((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = { ...prev };
      if (!next[id]) {
        return prev;
      }
      next[id] -= 1;
      if (next[id] <= 0) {
        delete next[id];
      }
      return next;
    });
  };

  const setItem = (id: string, quantity: number) => {
    setItems((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[id];
      } else {
        next[id] = quantity;
      }
      return next;
    });
  };

  const clear = () => setItems({});
  const totalItems = useMemo(
    () => Object.values(items).reduce((sum, qty) => sum + qty, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, totalItems, addItem, removeItem, setItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
};
