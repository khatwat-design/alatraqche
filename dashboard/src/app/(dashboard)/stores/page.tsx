"use client";

import { useEffect, useState } from "react";
import { Store, Save, Building2, Phone, Mail, MapPin, Coins } from "lucide-react";
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

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/store").then(({ data }) => {
      setSettings(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/store", settings);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-sm">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعدادات المتجر</h1>
            <p className="mt-0.5 text-sm text-gray-500">تعديل معلومات المتجر الأساسية</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="mb-5 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              <h2 className="text-base font-semibold text-gray-900">معلومات المتجر</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">اسم المتجر</label>
                <input
                  type="text"
                  value={settings.store_name || ""}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">رقم الهاتف</label>
                <input
                  type="text"
                  value={settings.store_phone || ""}
                  onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={settings.store_email || ""}
                  onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">العملة</label>
                <input
                  type="text"
                  value={settings.currency || "IQD"}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">وصف المتجر</label>
              <textarea
                value={settings.store_description || ""}
                onChange={(e) => setSettings({ ...settings, store_description: e.target.value })}
                className="input-field min-h-[100px] resize-y"
              />
            </div>
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">العنوان</label>
              <textarea
                value={settings.store_address || ""}
                onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                className="input-field min-h-[80px] resize-y"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="mb-5 flex items-center gap-2">
              <Coins className="h-5 w-5 text-accent" />
              <h2 className="text-base font-semibold text-gray-900">التوصيل</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">رسوم التوصيل</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
                  <input
                    type="number"
                    value={settings.delivery_fee || 0}
                    onChange={(e) => setSettings({ ...settings, delivery_fee: Number(e.target.value) })}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">التوصيل المجاني (أكثر من)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
                  <input
                    type="number"
                    value={settings.free_delivery_threshold || 0}
                    onChange={(e) => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              <h2 className="text-base font-semibold text-gray-900">معاينة</h2>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <p><span className="font-medium text-gray-700">المتجر:</span> {settings.store_name || "—"}</p>
              <p><span className="font-medium text-gray-700">الهاتف:</span> {settings.store_phone || "—"}</p>
              <p><span className="font-medium text-gray-700">التوصيل:</span> {settings.delivery_fee ? formatPrice(settings.delivery_fee) : "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPrice(v: number) {
  return new Intl.NumberFormat("ar-IQ", {
    style: "currency", currency: "IQD", minimumFractionDigits: 0,
  }).format(v);
}
