"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Tags, Plus, Pencil, Trash2, X, Upload, Search, Loader2 } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  sort_order?: number;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: null as File | null });
  const fileRef = useRef<HTMLInputElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    api.get("/admin/categories").then(({ data }) => {
      setCategories(data.categories || data.data || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", image: null });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", image: null });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("اسم التصنيف مطلوب"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      if (form.description) fd.append("description", form.description);
      if (form.image) fd.append("image", form.image);

      if (editing) {
        fd.append("_method", "PUT");
        await api.post(`/admin/categories/${editing.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("تم تحديث التصنيف بنجاح");
      } else {
        await api.post("/admin/categories", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("تم إنشاء التصنيف بنجاح");
      }

      setShowModal(false);
      fetchCategories();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = e?.response?.data?.message
        || e?.response?.data?.errors?.[Object.keys(e?.response?.data?.errors || {})[0]]?.[0]
        || "فشل حفظ التصنيف";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success("تم حذف التصنيف بنجاح");
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل حذف التصنيف";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-sm">
            <Tags className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التصنيفات</h1>
            <p className="mt-0.5 text-sm text-gray-500">{categories.length} تصنيف</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> إضافة تصنيف
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث..." className="input-field pr-9" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <Tags className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">لا توجد تصنيفات</p>
            <button onClick={openCreate} className="btn-primary mt-4 text-sm">
              <Plus className="h-4 w-4" /> إضافة تصنيف
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>التصنيف</th>
                  <th>المنتجات</th>
                  <th>الترتيب</th>
                  <th className="text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent/10 text-sm font-bold text-accent">
                          {cat.image ? (
                            <img src={cat.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            cat.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                          {cat.description && (
                            <p className="truncate text-xs text-gray-400 max-w-[200px]">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-gray-700">{cat.products_count ?? 0}</span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">{cat.sort_order ?? "—"}</span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(cat)}
                          className="btn-ghost p-1.5 text-gray-400 hover:text-blue-600" title="تعديل">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(cat.id)}
                          className="btn-ghost p-1.5 text-gray-400 hover:text-red-600" title="حذف">
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
          onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg animate-fade-in rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">اسم التصنيف *</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="مثال: سجاد" required autoFocus />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">الوصف</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field min-h-[80px] resize-y" placeholder="وصف التصنيف..." />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">الصورة</label>
                <div onClick={() => fileRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-accent hover:bg-accent-subtle">
                  <Upload className="mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">انقر لرفع صورة</p>
                  <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP</p>
                  <input ref={fileRef} type="file" className="hidden"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setForm({ ...form, image: file });
                      e.target.value = "";
                    }} />
                </div>
                {form.image && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <img src={URL.createObjectURL(form.image)} alt=""
                      className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{form.image.name}</p>
                      <p className="text-xs text-gray-400">{(form.image.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setForm({ ...form, image: null })}
                      className="btn-ghost p-1 text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {editing && !form.image && editing.image && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <img src={editing.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="text-sm text-gray-500">الصورة الحالية (سيتم الاحتفاظ بها)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <button onClick={() => setShowModal(false)} className="btn-secondary text-sm">إلغاء</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="btn-primary text-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
                {saving ? "جارٍ الحفظ..." : editing ? "حفظ التعديلات" : "إنشاء التصنيف"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
            <p className="mt-2 text-sm text-gray-500">
              هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                className="btn-danger">
                {deleting ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
