"use client";

import { useState } from "react";
import { Save, User, Shield, Bell, Lock, AtSign, Phone } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"profile" | "password" | "notifications">("profile");

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/admin/auth/profile", profile);
      toast.success("تم تحديث الملف الشخصي");
    } catch {
      toast.error("فشل التحديث");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "الملف الشخصي", icon: User },
    { id: "password" as const, label: "كلمة المرور", icon: Shield },
    { id: "notifications" as const, label: "الإشعارات", icon: Bell },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-sm">
          <SettingsIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          <p className="mt-0.5 text-sm text-gray-500">إعدادات الحساب والتفضيلات</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-100 pb-0">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "profile" && (
        <div className="max-w-2xl">
          <div className="card">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full gold-gradient text-lg font-bold text-white shadow-sm">
                {user?.name?.charAt(0) || "أ"}
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{user?.name || "المدير"}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  الاسم
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <AtSign className="h-4 w-4 text-gray-400" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400" />
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
                <Save className="h-4 w-4" />
                {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "password" && (
        <div className="max-w-2xl">
          <div className="card">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">تغيير كلمة المرور</h2>
                <p className="mt-0.5 text-sm text-gray-500">سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="max-w-2xl">
          <div className="card">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">إعدادات الإشعارات</h2>
                <p className="mt-0.5 text-sm text-gray-500">إدارة إشعارات الطلبات والتحديثات</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
