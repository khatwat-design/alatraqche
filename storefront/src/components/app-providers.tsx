"use client";

import { CartProvider } from "@/components/cart-context";
import AppShell from "@/components/app-shell";
import { StoreCustomerProvider } from "@/contexts/store-customer-context";
import { StorePixelsScripts, StoreSettingsProvider } from "@/contexts/store-settings-context";
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StoreSettingsProvider>
      <StorePixelsScripts />
      <StoreCustomerProvider>
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </StoreCustomerProvider>
    </StoreSettingsProvider>
  );
}
