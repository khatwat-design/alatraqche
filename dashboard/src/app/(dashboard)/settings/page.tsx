"use client";

import { useEffect, useState, useRef } from "react";
import { Store, User, Shield, Users, Save, Building2, Phone, Mail, MapPin, Coins, Lock, Eye, EyeOff, Loader2, AtSign, Bell, Plus, Pencil, Trash2, X, Search, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface StoreSettings {
  store_name?: string;
  store_description?: string;
  store_phone?: string;
  store_email?: string;
  store_address?: string;
  delivery_fee?: number;
  free_delivery_threshold?: number;
  currency?: string;
}

interface NotifSettings {
  newOrder: boolean;
  statusChange: boolean;
  lowStock: boolean;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  job_title: string;
  is_admin: boolean;
}

const roleLabels: Record<string, string> = {
  admin: "مدير عام",
  manager: "مدير",
  editor: "محرر",
  viewer: "مشاهد",
};

const roleColors: Record<string, string> = {
  admin: "badge-green",
  manager: "badge-blue",
  editor: "badge-purple",
  viewer: "badge-yellow",
};

export default function UnifiedSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<"store" | "profile" | "admins">("store");

  // ── Store tab ──
  const [store, setStore] = useState<StoreSettings>({});
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeSaving, setStoreSaving] = useState(false);

  // ── Profile tab ──
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ password: "", passwordConfirmation: "" });
  const [showPw, setShowPw] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotifSettings>({ newOrder: true, statusChange: true, lowStock: false });

  // ── Admins tab ──
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminSearch, setAdminSearch] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userSaving, setUserSaving] = useState(false);
  const [userForm, setUserForm] = useState({ first_name: "", last_name: "", email: "", phone: "", role: "editor", job_title: "", password: "", password_confirmation: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  useEffect(() => {
    if (tab === "store") {
      setStoreLoading(true);
      api.get("/admin/store").then(({ data }) => { setStore(data); setStoreLoading(false); }).catch(() => setStoreLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "admins") {
      setAdminsLoading(true);
      api.get("/admin/users").then(({ data }) => { setAdmins(data.users || []); setAdminsLoading(false); }).catch(() => setAdminsLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (user) setProfile({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem("alatraqchy-notif-settings");
    if (stored) { try { setNotifSettings(JSON.parse(stored)); } catch {} }
  }, []);

  // ── Store handlers ──
  const handleSaveStore = async () => {
    setStoreSaving(true);
    try { await api.put("/admin/store", store); toast.success("تم حفظ إعدادات المتجر"); }
    catch { toast.error("فشل حفظ الإعدادات"); }
    finally { setStoreSaving(false); }
  };

  // ── Profile handlers ──
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try { await api.put("/admin/auth/profile", profile); toast.success("تم تحديث الملف الشخصي"); }
    catch { toast.error("فشل التحديث"); }
    finally { setProfileSaving(false); }
  };

  const handleSavePassword = async () => {
    if (!passwordForm.password) { toast.error("كلمة المرور الجديدة مطلوبة"); return; }
    if (passwordForm.password.length < 8) { toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل"); return; }
    if (passwordForm.password !== passwordForm.passwordConfirmation) { toast.error("كلمة المرور غير متطابقة"); return; }
    setPwSaving(true);
    try {
      await api.put("/admin/auth/profile", { password: passwordForm.password, password_confirmation: passwordForm.passwordConfirmation });
      toast.success("تم تغيير كلمة المرور");
      setPasswordForm({ password: "", passwordConfirmation: "" });
    } catch { toast.error("فشل تغيير كلمة المرور"); }
    finally { setPwSaving(false); }
  };

  const handleSaveNotifs = () => {
    localStorage.setItem("alatraqchy-notif-settings", JSON.stringify(notifSettings));
    toast.success("تم حفظ إعدادات الإشعارات");
  };

  // ── Admin user handlers ──
  const openCreateUser = () => {
    setEditingUser(null);
    setUserForm({ first_name: "", last_name: "", email: "", phone: "", role: "editor", job_title: "", password: "", password_confirmation: "" });
    setShowUserModal(true);
  };

  const openEditUser = (u: AdminUser) => {
    const [first_name = "", ...rest] = u.name.split(" ");
    const last_name = rest.join(" ");
    setEditingUser(u);
    setUserForm({ first_name, last_name, email: u.email, phone: u.phone, role: u.role, job_title: u.job_title, password: "", password_confirmation: "" });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.first_name.trim() || !userForm.last_name.trim() || !userForm.email.trim()) {
      toast.error("الاسم والبريد الإلكتروني مطلوبان"); return;
    }
    if (!editingUser && (!userForm.password || userForm.password.length < 8)) {
      toast.error("كلمة المرور مطلوبة (8 أحرف على الأقل)"); return;
    }
    if (userForm.password && userForm.password !== userForm.password_confirmation) {
      toast.error("كلمة المرور غير متطابقة"); return;
    }
    setUserSaving(true);
    try {
      const payload: Record<string, string> = {
        first_name: userForm.first_name.trim(),
        last_name: userForm.last_name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
      };
      if (userForm.phone) payload.phone = userForm.phone;
      if (userForm.job_title) payload.job_title = userForm.job_title;
      if (userForm.password) { payload.password = userForm.password; payload.password_confirmation = userForm.password_confirmation; }

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
        toast.success("تم تحديث المستخدم");
      } else {
        await api.post("/admin/users", payload);
        toast.success("تم إنشاء المستخدم");
      }
      setShowUserModal(false);
      api.get("/admin/users").then(({ data }) => setAdmins(data.users || []));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      toast.error(e?.response?.data?.message || "فشل حفظ المستخدم");
    } finally { setUserSaving(false); }
  };

  const handleDeleteUser = async (id: number) => {
    setDeletingUser(true);
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("تم حذف المستخدم");
      setDeleteConfirm(null);
      api.get("/admin/users").then(({ data }) => setAdmins(data.users || []));
    } catch { toast.error("فشل حذف المستخدم"); }
    finally { setDeletingUser(false); }
  };

  const filteredAdmins = admins.filter((u) => u.name.toLowerCase().includes(adminSearch.toLowerCase()) || u.email.toLowerCase().includes(adminSearch.toLowerCase()));

  const tabs = [
    { id: "store" as const, label: "المتجر", icon: Store },
    { id: "profile" as const, label: "الملف الشخصي", icon: User },
    { id: "admins" as const, label: "المستخدمين", icon: Users },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-sm">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          <p className="mt-0.5 text-sm text-gray-500">إدارة المتجر والملف الشخصي والمستخدمين</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-100 pb-0 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                isActive ? "border-accent text-accent" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════
          TAB: المتجر
          ════════════════════════════════════════════════════════ */}
      {tab === "store" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {storeLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-accent" />
              </div>
            ) : (
              <>
                <div className="card">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-accent" />
                      <h2 className="text-base font-semibold text-gray-900">معلومات المتجر</h2>
                    </div>
                    <button onClick={handleSaveStore} disabled={storeSaving} className="btn-primary text-sm">
                      <Save className="h-4 w-4" />
                      {storeSaving ? "جارٍ الحفظ..." : "حفظ"}
                    </button>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">اسم المتجر</label>
                      <input type="text" value={store.store_name || ""} onChange={(e) => setStore({ ...store, store_name: e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">رقم الهاتف</label>
                      <input type="text" value={store.store_phone || ""} onChange={(e) => setStore({ ...store, store_phone: e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                      <input type="email" value={store.store_email || ""} onChange={(e) => setStore({ ...store, store_email: e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">العملة</label>
                      <input type="text" value={store.currency || "IQD"} onChange={(e) => setStore({ ...store, currency: e.target.value })} className="input-field" />
                    </div>
                  </div>
                  <div className="mt-5">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">وصف المتجر</label>
                    <textarea value={store.store_description || ""} onChange={(e) => setStore({ ...store, store_description: e.target.value })} className="input-field min-h-[100px] resize-y" />
                  </div>
                  <div className="mt-5">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">العنوان</label>
                    <textarea value={store.store_address || ""} onChange={(e) => setStore({ ...store, store_address: e.target.value })} className="input-field min-h-[80px] resize-y" />
                  </div>
                </div>

                <div className="card">
                  <div className="mb-5 flex items-center gap-2">
                    <Coins className="h-5 w-5 text-accent" />
                    <h2 className="text-base font-semibold text-gray-900">التوصيل</h2>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">رسوم التوصيل</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
                        <input type="number" value={store.delivery_fee || 0} onChange={(e) => setStore({ ...store, delivery_fee: Number(e.target.value) })} className="input-field pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">التوصيل المجاني (أكثر من)</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
                        <input type="number" value={store.free_delivery_threshold || 0} onChange={(e) => setStore({ ...store, free_delivery_threshold: Number(e.target.value) })} className="input-field pl-10" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                <h2 className="text-base font-semibold text-gray-900">معاينة</h2>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <p><span className="font-medium text-gray-700">المتجر:</span> {store.store_name || "—"}</p>
                <p><span className="font-medium text-gray-700">الهاتف:</span> {store.store_phone || "—"}</p>
                <p><span className="font-medium text-gray-700">البريد:</span> {store.store_email || "—"}</p>
                <p><span className="font-medium text-gray-700">التوصيل:</span> {store.delivery_fee ? new Intl.NumberFormat("ar-IQ", { style: "currency", currency: "IQD", minimumFractionDigits: 0 }).format(store.delivery_fee) : "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: الملف الشخصي
          ════════════════════════════════════════════════════════ */}
      {tab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="card">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full gold-gradient text-lg font-bold text-white shadow-sm">
                  {user?.name?.charAt(0) || "أ"}
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">{user?.name || "المدير"}</p>
                  <p className="text-xs text-gray-500">{user?.role ? roleLabels[user.role] || user.role : "مدير عام"}</p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4 text-gray-400" /> الاسم
                  </label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <AtSign className="h-4 w-4 text-gray-400" /> البريد الإلكتروني
                  </label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" /> رقم الهاتف
                  </label>
                  <input type="text" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field" />
                </div>
                <button onClick={handleSaveProfile} disabled={profileSaving} className="btn-primary">
                  <Save className="h-4 w-4" />
                  {profileSaving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
                <Bell className="h-5 w-5 text-accent" />
                إعدادات الإشعارات
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">اختر أنواع الإشعارات التي تريد استلامها:</p>
                {[
                  { key: "newOrder" as const, label: "طلبات جديدة", desc: "عند تقديم طلب جديد من عميل" },
                  { key: "statusChange" as const, label: "تغيير حالة الطلب", desc: "عند تحديث حالة طلب قائم" },
                  { key: "lowStock" as const, label: "مخزون منخفض", desc: "عند انخفاض مخزون أحد المنتجات" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !notifSettings[item.key] })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${notifSettings[item.key] ? "bg-accent" : "bg-gray-200"}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${notifSettings[item.key] ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
                <button onClick={handleSaveNotifs} className="btn-primary">
                  <Save className="h-4 w-4" /> حفظ الإعدادات
                </button>
              </div>
            </div>
          </div>

          <div className="card h-fit">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Lock className="h-5 w-5 text-accent" />
              تغيير كلمة المرور
            </h2>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    className="input-field pl-9" placeholder="8 أحرف على الأقل" minLength={8} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">تأكيد كلمة المرور</label>
                <input type="password" value={passwordForm.passwordConfirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, passwordConfirmation: e.target.value })}
                  className="input-field" placeholder="أعد إدخال كلمة المرور" />
              </div>
              <button onClick={handleSavePassword} disabled={pwSaving || !passwordForm.password} className="btn-primary">
                {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {pwSaving ? "جارٍ الحفظ..." : "تغيير كلمة المرور"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: المستخدمين
          ════════════════════════════════════════════════════════ */}
      {tab === "admins" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative max-w-xs">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="text" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} placeholder="بحث..." className="input-field pr-9" />
            </div>
            <button onClick={openCreateUser} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> إضافة مستخدم
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {adminsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-accent" />
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">{adminSearch ? "لا توجد نتائج" : "لا يوجد مستخدمين"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>المستخدم</th>
                      <th>المسمى الوظيفي</th>
                      <th>الصلاحية</th>
                      <th className="text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredAdmins.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gold-gradient text-xs font-bold text-white">
                              {u.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900">{u.name}</p>
                              <p className="truncate text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm text-gray-700">{u.job_title || "—"}</span>
                        </td>
                        <td>
                          <span className={`badge text-xs ${roleColors[u.role] || "badge-gray"}`}>
                            {roleLabels[u.role] || u.role}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditUser(u)} className="btn-ghost p-1.5 text-gray-400 hover:text-blue-600" title="تعديل">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(u.id)} className="btn-ghost p-1.5 text-gray-400 hover:text-red-600" title="حذف">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── User Create/Edit Modal ── */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12" onClick={() => setShowUserModal(false)}>
          <div className="w-full max-w-lg animate-fade-in rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">{editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</h2>
              <button onClick={() => setShowUserModal(false)} className="btn-ghost p-1 text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">الاسم الأول *</label>
                  <input type="text" value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} className="input-field" placeholder="محمد" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">الاسم الأخير *</label>
                  <input type="text" value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} className="input-field" placeholder="علي" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">البريد الإلكتروني *</label>
                <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="input-field" placeholder="user@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">رقم الهاتف</label>
                <input type="text" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="input-field" placeholder="0770xxxxxxx" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">الصلاحية *</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="input-field">
                    <option value="admin">مدير عام</option>
                    <option value="manager">مدير</option>
                    <option value="editor">محرر</option>
                    <option value="viewer">مشاهد</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">المسمى الوظيفي</label>
                  <input type="text" value={userForm.job_title} onChange={(e) => setUserForm({ ...userForm, job_title: e.target.value })} className="input-field" placeholder="مدير مبيعات" />
                </div>
              </div>
              {!editingUser && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">كلمة المرور *</label>
                    <input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="input-field" placeholder="8 أحرف على الأقل" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">تأكيد كلمة المرور</label>
                    <input type="password" value={userForm.password_confirmation} onChange={(e) => setUserForm({ ...userForm, password_confirmation: e.target.value })} className="input-field" placeholder="أعد إدخال كلمة المرور" />
                  </div>
                </div>
              )}
              {editingUser && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">اترك حقول كلمة المرور فارغة إذا لم ترد تغييرها</p>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">كلمة المرور الجديدة</label>
                      <input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="input-field" placeholder="8 أحرف على الأقل" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">تأكيد كلمة المرور</label>
                      <input type="password" value={userForm.password_confirmation} onChange={(e) => setUserForm({ ...userForm, password_confirmation: e.target.value })} className="input-field" placeholder="أعد إدخال كلمة المرور" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <button onClick={() => setShowUserModal(false)} className="btn-secondary text-sm">إلغاء</button>
              <button onClick={handleSaveUser} disabled={userSaving} className="btn-primary text-sm">
                {userSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingUser ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
                {userSaving ? "جارٍ الحفظ..." : editingUser ? "حفظ التعديلات" : "إضافة المستخدم"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
            <p className="mt-2 text-sm text-gray-500">هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">إلغاء</button>
              <button onClick={() => handleDeleteUser(deleteConfirm)} disabled={deletingUser} className="btn-danger">
                {deletingUser ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
