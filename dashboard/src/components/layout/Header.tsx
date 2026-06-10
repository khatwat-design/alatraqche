"use client";

import { Menu, Bell, Search, X, Check, Loader2, Package, ShoppingCart, Users, Tags, LayoutDashboard, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface NotificationItem {
  id: string;
  type: string;
  data: {
    message: string;
    order_id?: number;
    invoice_id?: string;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
}

const searchPages = [
  { label: "لوحة التحكم", href: "/", icon: "dashboard", keywords: ["رئيسية", "احصائيات", "stats", "home"] },
  { label: "المنتجات", href: "/products", icon: "products", keywords: ["منتج", "منتجات", "سلعة", "product"] },
  { label: "الطلبات", href: "/orders", icon: "orders", keywords: ["طلب", "طلبات", "فاتورة", "order", "invoice"] },
  { label: "العملاء", href: "/customers", icon: "customers", keywords: ["عميل", "عملاء", "زبون", "customer"] },
  { label: "البنرات", href: "/banners", icon: "banners", keywords: ["بانر", "بنرات", "اعلان", "banner"] },
  { label: "المتجر", href: "/stores", icon: "stores", keywords: ["متجر", "اعدادات", "store", "settings"] },
  { label: "الإعدادات", href: "/settings", icon: "settings", keywords: ["اعدادات", "ملف", "profile", "password"] },
  { label: "تحليلات", href: "/analytics", icon: "analytics", keywords: ["تحليل", "احصائيات", "charts", "analytics"] },
];

const searchIconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  products: <Package className="h-4 w-4" />,
  orders: <ShoppingCart className="h-4 w-4" />,
  customers: <Users className="h-4 w-4" />,
  banners: <Tags className="h-4 w-4" />,
  stores: <Settings className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  analytics: <LayoutDashboard className="h-4 w-4" />,
};

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ label: string; href: string; icon: string }[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.trim().toLowerCase();
    const results = searchPages.filter((p) =>
      p.label.includes(q) || p.keywords.some((k) => k.includes(q))
    );
    setSearchResults(results.slice(0, 6));
  }, [searchQuery]);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications?.data ?? data.notifications ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } catch {} finally {
      setLoadingNotifs(false);
    }
  }, []);

  // SSE for real-time notifications with fallback polling
  useEffect(() => {
    if (!token) return;
    const url = `${apiBase}/notifications/stream?token=${token}`;
    const es = new EventSource(url);
    sseRef.current = es;

    es.addEventListener("connected", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setUnreadCount(data.unread_count ?? 0);
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    });

    es.addEventListener("notifications", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setUnreadCount(data.unread_count ?? 0);
      if (data.list) {
        setNotifications(data.list);
      }
    });

    es.addEventListener("error", () => {
      es.close();
      if (!pollRef.current) {
        pollRef.current = setInterval(async () => {
          try {
            const { data } = await api.get("/notifications");
            setNotifications(data.notifications?.data ?? data.notifications ?? []);
            setUnreadCount(data.unread_count ?? 0);
          } catch {}
        }, 15000);
      }
    });

    return () => {
      es.close();
      sseRef.current = null;
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [token, apiBase]);

  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen, fetchNotifications]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} د`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} س`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `منذ ${days} ي`;
    const weeks = Math.floor(days / 7);
    return `منذ ${weeks} أ`;
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {}
  };

  return (
    <>
      <header className="glass sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 px-4 lg:px-6">
        <button onClick={onMenuClick} className="btn-ghost p-1.5 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="btn-ghost ml-2 p-1.5 sm:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

        <div className="relative hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في لوحة التحكم..."
            className="input-field h-9 rounded-xl pr-9 text-sm"
            onFocus={() => setSearchOpen(true)}
          />
          <div className="pointer-events-none absolute left-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400 sm:flex">
            ⌘K
          </div>
        </div>

        <div className="mr-auto flex items-center gap-2">
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="btn-ghost relative p-1.5">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full gold-gradient px-1 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 origin-top-left animate-fade-in rounded-2xl border border-gray-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-900">الإشعارات</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover">
                      <Check className="h-3 w-3" /> تحديد الكل كمقروء
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loadingNotifs ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                      <p className="text-sm text-gray-400">لا توجد إشعارات</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-right transition-colors hover:bg-gray-50 ${
                          !notif.read_at ? "bg-accent/5" : ""
                        }`}
                      >
                        <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                          !notif.read_at ? "bg-accent" : "bg-transparent"
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notif.data?.message || "إشعار"}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mr-2 flex items-center gap-2.5 border-r border-gray-200 pr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full gold-gradient text-sm font-bold text-white shadow-sm">
              {user?.name?.charAt(0) || "أ"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || "المدير"}</p>
              <p className="text-xs text-gray-500">مدير النظام</p>
            </div>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-sm"
          onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
          <div className="w-full max-w-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="mx-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="relative">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن صفحات، طلبات، منتجات..."
                  className="w-full border-0 border-b border-gray-100 bg-transparent px-4 pr-12 py-4 text-base text-gray-900 outline-none placeholder:text-gray-400"
                  autoFocus
                  dir="rtl"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {searchResults.length > 0 ? (
                <div className="p-1.5">
                  {searchResults.map((r) => (
                    <button
                      key={r.href}
                      onClick={() => { router.push(r.href); setSearchOpen(false); setSearchQuery(""); }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                        {searchIconMap[r.icon] || <Search className="h-4 w-4" />}
                      </span>
                      {r.label}
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  لا توجد نتائج لـ &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  اكتب لبدء البحث...
                </div>
              )}
              <div className="border-t border-gray-50 px-4 py-2.5 text-xs text-gray-400">
                <kbd className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">ESC</kbd>
                {' '}للإغلاق
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
