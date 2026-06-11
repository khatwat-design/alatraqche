"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Grip,
  X,
} from "lucide-react";
import { useState } from "react";

const mainNavItems = [
  { href: "/", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/products", label: "المنتجات", icon: Package },
  { href: "/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/customers", label: "العملاء", icon: Users },
];

const moreItems = [
  { href: "/categories", label: "التصنيفات", icon: Tags },
  { href: "/banners", label: "البنرات", icon: ImageIcon },
  { href: "/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const anyMoreActive = moreItems.some((i) => isActive(i.href));

  return (
    <>
      <nav className="fixed bottom-0 right-0 left-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-all ${
                active ? "text-accent" : "text-gray-500"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  active
                    ? "gold-gradient text-white shadow-sm shadow-accent/20"
                    : ""
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={() => setShowMore(true)}
          className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-all ${
            anyMoreActive ? "text-accent" : "text-gray-500"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
              anyMoreActive
                ? "gold-gradient text-white shadow-sm shadow-accent/20"
                : ""
            }`}
          >
            <Grip className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-medium leading-none">المزيد</span>
        </button>
      </nav>

      {showMore && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />
          <div className="absolute bottom-0 right-0 left-0 animate-slide-up rounded-t-2xl border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">القائمة</h3>
              <button
                onClick={() => setShowMore(false)}
                className="btn-ghost p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                        active
                          ? "gold-gradient text-white shadow-sm"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
