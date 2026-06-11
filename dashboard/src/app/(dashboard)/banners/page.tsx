"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Image, X, Check, Search, Upload, Star } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Banner {
  id: number;
  title: string;
  image?: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BannerForm {
  title: string;
  link_url: string;
  is_active: boolean;
  imageFile?: File | null;
  imagePreview?: string;
}

const emptyForm: BannerForm = { title: "", link_url: "", is_active: true, imageFile: null, imagePreview: undefined };

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = () => {
    setLoading(true);
    api.get("/admin/banners").then(({ data }) => {
      setBanners(data.banners || data.data || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      link_url: banner.link_url || "",
      is_active: banner.is_active,
      imageFile: null,
      imagePreview: banner.image,
    });
    setModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 2 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, imageFile: file, imagePreview: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("يرجى إدخال عنوان البانر");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      if (form.link_url) fd.append("link_url", form.link_url);
      fd.append("is_active", form.is_active ? "1" : "0");
      if (form.imageFile) fd.append("image", form.imageFile);

      if (editing) {
        fd.append("_method", "PUT");
        await api.post(`/admin/banners/${editing.id}`, fd);
        toast.success("تم تحديث البانر بنجاح");
      } else {
        await api.post("/admin/banners", fd);
        toast.success("تم إنشاء البانر بنجاح");
      }
      setModalOpen(false);
      fetchBanners();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || (editing ? "فشل تحديث البانر" : "فشل إنشاء البانر");
      toast.error(typeof msg === "string" ? msg : "فشل إنشاء البانر");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/admin/banners/${id}`);
      toast.success("تم حذف البانر بنجاح");
      setDeleteConfirm(null);
      fetchBanners();
    } catch {
      toast.error("فشل حذف البانر");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await api.put(`/admin/banners/${banner.id}`, { is_active: !banner.is_active });
      toast.success(banner.is_active ? "تم إيقاف البانر" : "تم تفعيل البانر");
      fetchBanners();
    } catch {
      toast.error("فشل تغيير حالة البانر");
    }
  };

  const filtered = banners.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-sm">
            <Image className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">البنرات</h1>
            <p className="mt-0.5 text-sm text-gray-500">إدارة بنرات المتجر — {filtered.length} بانر</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" />
          إضافة بانر جديد
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن بانر..."
          className="input-field pr-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <Image className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">لا توجد بنرات</p>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>العنوان</th>
                <th>الترتيب</th>
                <th>الحالة</th>
                <th className="text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((banner) => (
                <tr key={banner.id}>
                  <td>
                    <div className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm font-medium text-gray-900">{banner.title}</span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600">{banner.sort_order}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        banner.is_active
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      <Check
                        className={`h-3 w-3 ${banner.is_active ? "text-green-500" : "text-red-500"}`}
                      />
                      {banner.is_active ? "نشط" : "غير نشط"}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(banner)}
                        className="btn-ghost p-1.5 text-gray-400 hover:text-blue-600"
                        title="تعديل"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(banner.id)}
                        className="btn-ghost p-1.5 text-gray-400 hover:text-red-600"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg animate-fade-in rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? "تعديل البانر" : "إضافة بانر جديد"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="btn-ghost p-1 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 p-6">
              {/* Image upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">صورة البانر</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-accent hover:bg-accent-subtle"
                >
                  {form.imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={form.imagePreview}
                        alt="Preview"
                        className="mx-auto max-h-40 rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({ ...form, imageFile: null, imagePreview: editing?.image });
                        }}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 h-10 w-10 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">انقر لرفع صورة</p>
                      <p className="mt-1 text-xs text-gray-400">JPG, PNG, WebP — حتى 2MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">العنوان</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="عنوان البانر"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">رابط الوجهة</label>
                <input
                  type="text"
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://example.com"
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${form.is_active ? "bg-green-500" : "bg-gray-300"}`}
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                >
                  <div
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${form.is_active ? "translate-x-[22px]" : "translate-x-0.5"}`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">نشط</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">
                إلغاء
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "جارٍ الحفظ..." : editing ? "تحديث" : "إنشاء"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
            <p className="mt-2 text-sm text-gray-500">هل أنت متأكد من حذف هذا البانر؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} className="btn-primary !bg-red-600 !text-white hover:!bg-red-700">
                {deleting ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
