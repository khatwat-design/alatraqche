"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Store,
  Image as ImageIcon,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Tags,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/products", label: "المنتجات", icon: Package },
  { href: "/categories", label: "التصنيفات", icon: Tags },
  { href: "/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/customers", label: "العملاء", icon: Users },
  { href: "/banners", label: "البنرات", icon: ImageIcon },
  { href: "/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-64 flex-col border-l border-gray-100 bg-white/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-5">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gold-gradient shadow-sm">
              <Image src="/logo.png" alt="الأطرقجي" width={22} height={22} unoptimized className="h-5 w-5 object-contain brightness-0 invert" />
            </div>
            <span className="text-base font-bold">
              <span className="text-gray-900">الأ</span>
              <span className="gold-text">طرقجي</span>
            </span>
          </Link>
          <button onClick={onClose} className="btn-ghost p-1 text-gray-400 lg:hidden">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
            القائمة الرئيسية
          </div>
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-accent/10 text-accent shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                      isActive
                        ? "gold-gradient text-white shadow-sm shadow-accent/20"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {item.label}
                  {isActive && <div className="mr-auto h-1.5 w-1.5 rounded-full bg-accent" />}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-gray-100 p-3">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gold-gradient text-xs font-bold text-white shadow-sm">
              {user?.name?.charAt(0) || "أ"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{user?.name || "المدير"}</p>
              <p className="truncate text-xs text-gray-500">مدير النظام</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-colors group-hover:bg-red-100">
              <LogOut className="h-4 w-4" />
            </div>
            {loggingOut ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
          </button>
        </div>
      </aside>
    </>
  );
}
