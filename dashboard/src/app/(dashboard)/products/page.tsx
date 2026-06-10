"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, Pencil, Trash2, Eye, X, Package, Store, Plus, Layers, Tag, Check, ChevronLeft, ChevronRight, Loader2, AlertCircle, Upload, Star } from "lucide-react";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category?: string;
  category_id?: number;
  is_active: boolean;
  badge?: string;
  image?: string;
  description?: string;
  sort_order?: number;
  created_at?: string;
  thumbnail?: string;
}

interface Category {
  id: number;
  name: string;
  image?: string;
  is_enabled: boolean;
  products_count?: number;
}

interface StoreSettings {
  store_name?: string;
  logo_url?: string;
}

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-6 py-4">
      {steps.map((label, i) => (
        <div key={i} className="flex shrink-0 items-center gap-2">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
            i <= current ? "bg-accent text-white" : "bg-gray-100 text-gray-400"
          }`}>
            {i < current ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span className={`text-xs font-medium ${i <= current ? "text-accent" : "text-gray-400"}`}>
            {label}
          </span>
          {i < steps.length - 1 && <div className={`h-px w-6 sm:w-8 ${i < current ? "bg-accent" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [saving, setSaving] = useState(false);
  interface ImageFile {
    file: File;
    preview: string;
    isPrimary: boolean;
  }

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    badge: "",
    is_active: true,
    sort_order: "0",
    images: [] as ImageFile[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{ name: string; description: string; image: File | null }>({ name: "", description: "", image: null });
  const [savingCategory, setSavingCategory] = useState(false);
  const categoryFileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    api.get("/admin/products?per_page=100").then(({ data }) => {
      setProducts(data.products || data.data || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchCategories = useCallback(() => {
    api.get("/admin/categories").then(({ data }) => {
      setCategories(data.categories || data.data || data);
    }).catch(() => {});
  }, []);

  const fetchStore = useCallback(() => {
    api.get("/admin/store").then(({ data }) => {
      setStore(data.store || data.data || data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStore();
  }, [fetchProducts, fetchCategories, fetchStore]);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success("تم حذف المنتج بنجاح");
      setDeleteConfirm(null);
      fetchProducts();
    } catch {
      toast.error("فشل حذف المنتج");
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stock: "", category_id: "", badge: "", is_active: true, sort_order: "0", images: [] });
    setCreateStep(0);
  };

  const handleCreateProduct = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (form.description) fd.append("description", form.description);
      fd.append("price", String(Number(form.price)));
      if (form.stock) fd.append("stock", String(Number(form.stock)));
      if (form.category_id) fd.append("category_id", form.category_id);
      if (form.badge) fd.append("badge", form.badge);
      fd.append("is_active", form.is_active ? "1" : "0");
      fd.append("sort_order", String(Number(form.sort_order)));

      const primaryIdx = form.images.findIndex((img) => img.isPrimary);
      if (primaryIdx >= 0) {
        fd.append("primary_image", String(primaryIdx));
      }

      form.images.forEach((img, i) => {
        fd.append(`images[${i}]`, img.file);
      });

      await api.post("/admin/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("تم إضافة المنتج بنجاح");
      setShowCreate(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[Object.keys(err?.response?.data?.errors || {})[0]]?.[0] || "فشل إضافة المنتج";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("اسم التصنيف مطلوب");
      return;
    }
    setSavingCategory(true);
    try {
      const fd = new FormData();
      fd.append("name", categoryForm.name);
      if (categoryForm.description) fd.append("description", categoryForm.description);
      if (categoryForm.image) fd.append("image", categoryForm.image);
      await api.post("/admin/categories", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("تم إنشاء التصنيف بنجاح");
      setShowCategoryModal(false);
      setCategoryForm({ name: "", description: "", image: null });
      fetchCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[Object.keys(err?.response?.data?.errors || {})[0]]?.[0] || "فشل إنشاء التصنيف";
      toast.error(msg);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: ImageFile[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`الصورة "${file.name}" تجاوزت 5MB`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        valid.push({ file, preview: reader.result as string, isPrimary: form.images.length + valid.length === 0 });
        if (valid.length === files.filter((f) => f.size <= 5 * 1024 * 1024).length) {
          setForm((prev) => ({ ...prev, images: [...prev.images, ...valid] }));
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setForm((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      if (prev.images[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return { ...prev, images: updated };
    });
  };

  const setPrimary = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index })),
    }));
  };

  const createSteps = ["المعلومات", "السعر", "التصنيف", "الصورة"];

  const canNextStep = () => {
    if (createStep === 0) return form.name.trim().length > 0;
    if (createStep === 1) return form.price.trim().length > 0 && Number(form.price) > 0;
    return true;
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" ? true : filterStatus === "active" ? p.is_active : !p.is_active;
    const matchCat = filterCategory === "all" ? true : String(p.category_id) === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const activeCount = products.filter((p) => p.is_active).length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Store Banner */}
      {store && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gold-gradient shadow-sm">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{store.store_name || "المتجر"}</p>
              <p className="text-xs text-gray-500">
                <span className="font-medium text-accent">{products.length}</span> منتج •{" "}
                <span className="font-medium text-green-600">{activeCount}</span> نشط •{" "}
                <span className="font-medium text-gray-600">{categories.length}</span> تصنيف
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-sm">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
            <p className="mt-0.5 text-sm text-gray-500">{filtered.length} منتج من أصل {products.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowCategoryModal(true); setCategoryForm({ name: "", description: "", image: null }); }} className="btn-secondary text-sm">
            <Tag className="h-4 w-4" />
            تصنيفات
          </button>
          <button onClick={() => { setShowCreate(true); resetForm(); }} className="btn-primary">
            <Plus className="h-4 w-4" />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="input-field pr-9" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="input-field w-32">
          <option value="all">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field w-40">
          <option value="all">كل التصنيفات</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
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
              <Package className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">لا توجد منتجات</p>
            <button onClick={() => { setShowCreate(true); resetForm(); }} className="btn-primary mt-4 text-sm">
              <Plus className="h-4 w-4" /> إضافة منتج
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>السعر</th>
                  <th>المخزون</th>
                  <th>التصنيف</th>
                  <th>الحالة</th>
                  <th className="text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent/10 text-sm font-bold text-accent">
                          {product.image ? (
                            <img src={product.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            product.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                          {product.badge && (
                            <span className="mt-0.5 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className="font-semibold text-gray-900">{formatPrice(product.price)}</span></td>
                    <td>
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        (product.stock ?? 0) <= 0 ? "text-red-600" :
                        (product.stock ?? 0) < 10 ? "text-warning" : "text-gray-700"
                      }`}>
                        <span className={`status-dot ${
                          (product.stock ?? 0) <= 0 ? "bg-red-500" :
                          (product.stock ?? 0) < 10 ? "bg-warning" : "bg-green-500"
                        }`} />
                        {product.stock ?? "-"}
                      </span>
                    </td>
                    <td>
                      {product.category ? (
                        <span className="badge badge-gray">{product.category}</span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${product.is_active ? "badge-green" : "badge-red"}`}>
                        {product.is_active ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewProduct(product)} className="btn-ghost p-1.5 text-gray-400 hover:text-accent" title="عرض">
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link href={`/products/${product.id}/edit`} className="btn-ghost p-1.5 text-gray-400 hover:text-blue-600" title="تعديل">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => setDeleteConfirm(product.id)} className="btn-ghost p-1.5 text-gray-400 hover:text-red-600" title="حذف">
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

      {/* ── Multi-step Create Modal ──────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-2xl animate-fade-in rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">إضافة منتج جديد</h2>
              <button onClick={() => setShowCreate(false)} className="btn-ghost p-1 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <Stepper steps={createSteps} current={createStep} />

            <div className="px-6 pb-6">
              {/* Step 1: Basic Info */}
              {createStep === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">اسم المنتج *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field" placeholder="مثال: سجاد تركي فاخر" required autoFocus />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">الوصف</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="input-field min-h-[100px] resize-y" placeholder="وصف المنتج..." />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">الوسم (Badge)</label>
                      <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                        className="input-field" placeholder="جديد / تخفيض / مميز" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">ترتيب العرض</label>
                      <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                        className="input-field" placeholder="0" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Price & Stock */}
              {createStep === 1 && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">السعر *</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
                        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                          className="input-field pl-10" placeholder="50000" required />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">المخزون</label>
                      <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        className="input-field" placeholder="10" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${form.is_active ? "bg-green-500" : "bg-gray-300"}`}
                      onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                      <div className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${form.is_active ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">منتج نشط</p>
                      <p className="text-xs text-gray-500">ظهور المنتج في المتجر للعملاء</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Category */}
              {createStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">التصنيف</label>
                      <button type="button" onClick={() => { setShowCategoryModal(true); setCategoryForm({ name: "", description: "", image: null }); }}
                        className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover">
                        <Plus className="h-3 w-3" /> إضافة تصنيف جديد
                      </button>
                    </div>
                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
                      <option value="">بدون تصنيف</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {form.category_id && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent/5 p-3 text-sm text-gray-600">
                        <Layers className="h-4 w-4 text-accent" />
                        سيظهر هذا المنتج في تصنيف &quot;
                        {categories.find((c) => String(c.id) === form.category_id)?.name}
                        &quot; في المتجر
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Image Upload */}
              {createStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">صور المنتج</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-8 text-center transition-colors hover:border-accent hover:bg-accent-subtle"
                    >
                      <Upload className="mb-2 h-10 w-10 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">انقر لرفع صور</p>
                      <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP — حتى 5MB للصورة</p>
                      <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleImagesChange} />
                    </div>
                  </div>

                  {form.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {form.images.map((img, i) => (
                        <div key={i} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                          <img src={img.preview} alt="" className="h-32 w-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                          <div className="absolute left-1 top-1 flex gap-1">
                            <button type="button" onClick={() => removeImage(i)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button type="button" onClick={() => setPrimary(i)}
                            className={`absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all ${
                              img.isPrimary ? "bg-yellow-400 text-white scale-110" : "bg-white/90 text-gray-300 opacity-0 group-hover:opacity-100"
                            }`}
                            title={img.isPrimary ? "الصورة الأساسية" : "تعيين كصورة أساسية"}>
                            <Star className="h-3.5 w-3.5" fill={img.isPrimary ? "currentColor" : "none"} />
                          </button>
                          {img.isPrimary && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                              أساسية
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                <button type="button" onClick={() => setCreateStep(Math.max(0, createStep - 1))}
                  disabled={createStep === 0} className="btn-secondary text-sm disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" /> السابق
                </button>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  الخطوة {createStep + 1} من {createSteps.length}
                </div>
                {createStep < createSteps.length - 1 ? (
                  <button type="button" onClick={() => setCreateStep(createStep + 1)}
                    disabled={!canNextStep()} className="btn-primary text-sm disabled:opacity-40">
                    التالي <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleCreateProduct} disabled={saving}
                    className="btn-primary text-sm">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {saving ? "جارٍ الحفظ..." : "حفظ المنتج"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Modal ───────────────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12" onClick={() => setShowCategoryModal(false)}>
          <div className="w-full max-w-lg animate-fade-in rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">إدارة التصنيفات</h2>
              <button onClick={() => setShowCategoryModal(false)} className="btn-ghost p-1 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Existing categories */}
            {categories.length > 0 && (
              <div className="border-b border-gray-50 px-6 py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">التصنيفات الحالية</p>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent/10 text-sm font-bold text-accent">
                        {cat.image ? (
                          <img src={cat.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          cat.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400">{cat.products_count ?? 0} منتج</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">اسم التصنيف *</label>
                <input type="text" value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="input-field" placeholder="مثال: سجاد" required autoFocus />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">الوصف (اختياري)</label>
                <textarea value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="input-field min-h-[80px] resize-y" placeholder="وصف التصنيف..." />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">صورة التصنيف (اختياري)</label>
                <div
                  onClick={() => categoryFileRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-accent hover:bg-accent-subtle"
                >
                  <Upload className="mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">انقر لرفع صورة</p>
                  <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP — حتى 2MB</p>
                  <input ref={categoryFileRef} type="file" className="hidden" accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCategoryForm({ ...categoryForm, image: file });
                      e.target.value = "";
                    }} />
                </div>
                {categoryForm.image && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <img src={URL.createObjectURL(categoryForm.image)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{categoryForm.image.name}</p>
                      <p className="text-xs text-gray-400">{(categoryForm.image.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setCategoryForm({ ...categoryForm, image: null })}
                      className="btn-ghost p-1 text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <button onClick={() => setShowCategoryModal(false)} className="btn-secondary text-sm">إلغاء</button>
              <button onClick={handleCreateCategory} disabled={savingCategory || !categoryForm.name.trim()} className="btn-primary text-sm">
                {savingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                {savingCategory ? "جارٍ الحفظ..." : "إنشاء التصنيف"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Product Modal ───────────────────────────────── */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setViewProduct(null)}>
          <div className="w-full max-w-lg animate-fade-in rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">{viewProduct.name}</h2>
              <button onClick={() => setViewProduct(null)} className="btn-ghost p-1 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/10 text-2xl font-bold text-accent">
                  {viewProduct.image ? (
                    <img src={viewProduct.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    viewProduct.name.charAt(0)
                  )}
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-gray-500">السعر</p>
                    <p className="text-xl font-bold text-gray-900">{formatPrice(viewProduct.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المخزون</p>
                    <p className="text-xl font-bold text-gray-900">{viewProduct.stock ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="divider" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">التصنيف</p>
                  <p className="font-medium text-gray-900">{viewProduct.category || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">الحالة</p>
                  <span className={`badge mt-1 ${viewProduct.is_active ? "badge-green" : "badge-red"}`}>
                    {viewProduct.is_active ? "نشط" : "غير نشط"}
                  </span>
                </div>
                {viewProduct.badge && (
                  <div>
                    <p className="text-gray-500">الوسم</p>
                    <span className="badge badge-purple mt-1">{viewProduct.badge}</span>
                  </div>
                )}
              </div>
              {viewProduct.description && (
                <div>
                  <p className="mb-1 text-sm text-gray-500">الوصف</p>
                  <p className="text-sm text-gray-700">{viewProduct.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ──────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
            <p className="mt-2 text-sm text-gray-500">هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} className="btn-danger">
                {deleting ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
