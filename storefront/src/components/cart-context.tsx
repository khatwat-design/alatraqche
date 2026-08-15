"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type OptionSelection = {
  optionId: number;
  valueId: number;
  value: string;
  priceAdjustment: number;
};

export type CartItemEntry = {
  productId: string;
  selectedOptions: OptionSelection[];
};

const STORAGE_KEY = "alatraqji-cart-v2";

export function makeCartKey(productId: string, selectedOptions?: OptionSelection[]): string {
  if (!selectedOptions || selectedOptions.length === 0) return productId + "::";
  const opts = selectedOptions
    .map((o) => o.optionId + ":" + o.valueId)
    .sort()
    .join(",");
  return productId + "::" + opts;
}

export function parseCartKey(key: string): CartItemEntry {
  const sep = key.indexOf("::");
  if (sep < 0) return { productId: key, selectedOptions: [] };
  const productId = key.slice(0, sep);
  const optsStr = key.slice(sep + 2);
  if (!optsStr) return { productId, selectedOptions: [] };
  const selectedOptions: OptionSelection[] = optsStr.split(",").filter(Boolean).map((pair) => {
    const [optionId, valueId] = pair.split(":").map(Number);
    return { optionId, valueId, value: "", priceAdjustment: 0 };
  });
  return { productId, selectedOptions };
}

type CartState = Record<string, number>;

type CartContextValue = {
  items: CartState;
  totalItems: number;
  addItem: (productId: string, selectedOptions?: OptionSelection[]) => void;
  removeItem: (key: string) => void;
  setItem: (key: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const safeParse = (value: string | null): CartState => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
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

  const addItem = (productId: string, selectedOptions?: OptionSelection[]) => {
    const key = makeCartKey(productId, selectedOptions);
    setItems((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  };

  const removeItem = (key: string) => {
    setItems((prev) => {
      const next = { ...prev };
      if (!next[key]) return prev;
      next[key] -= 1;
      if (next[key] <= 0) delete next[key];
      return next;
    });
  };

  const setItem = (key: string, quantity: number) => {
    setItems((prev) => {
      const next = { ...prev };
      if (quantity <= 0) delete next[key];
      else next[key] = quantity;
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
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
