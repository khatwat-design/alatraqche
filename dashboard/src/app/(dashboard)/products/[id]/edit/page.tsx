"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, Loader2, Upload, X, Star, Trash2, AlertCircle, Check } from "lucide-react";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface ProductData {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  badge: string | null;
  category_id: string | null;
  category: string;
  is_active: boolean;
  sort_order: number;
  image: string | null;
  images: { url: string; large: string; thumb: string }[];
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface ImageFile {
  file: File;
  preview: string;
  isPrimary: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [existingImages, setExistingImages] = useState<{ url: string; thumb: string; isPrimary: boolean }[]>([]);
  const [newImages, setNewImages] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    badge: "",
    is_active: true,
    sort_order: "0",
  });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: productData }, { data: catData }] = await Promise.all([
          api.get(`/admin/products/${productId}`),
          api.get("/admin/categories"),
        ]);
        const p = productData.product || productData.data || productData;
        setProduct(p);
        setForm({
          name: p.name || "",
          description: p.description || "",
          price: String(p.price ?? ""),
          stock: String(p.stock ?? ""),
          category_id: String(p.category_id ?? ""),
          badge: p.badge || "",
          is_active: p.is_active ?? true,
          sort_order: String(p.sort_order ?? "0"),
        });
        const imgs = p.images || [];
        setExistingImages(
          imgs.length > 0
            ? imgs.map((img: any, i: number) => ({ url: img.url || img.large || img, thumb: img.thumb || img.url || img, isPrimary: i === 0 }))
            : p.image
              ? [{ url: p.image, thumb: p.image, isPrimary: true }]
              : []
        );
        setCategories(catData.categories || catData.data || catData || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const setPrimaryExisting = (index: number) => {
    setExistingImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: ImageFile[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`الصورة "${file.name}" تجاوزت 5MB`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        valid.push({ file, preview: reader.result as string, isPrimary: false });
        if (valid.length === files.filter((f) => f.size <= 5 * 1024 * 1024).length) {
          setNewImages((prev) => {
            const updated = [...prev, ...valid];
            if (updated.length > 0 && existingImages.length === 0 && updated.filter((x) => x.isPrimary).length === 0) {
              updated[0].isPrimary = true;
            }
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      if (updated.length === 0 && existingImages.length > 0) {
        setExistingImages((prevExisting) => prevExisting.map((img, i) => ({ ...img, isPrimary: i === 0 })));
      }
      return updated;
    });
  };

  const setPrimaryNew = (index: number) => {
    setNewImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
    setExistingImages((prev) => prev.map((img) => ({ ...img, isPrimary: false })));
  };

  const totalImages = existingImages.length + newImages.length;
  const hasPrimary = [...existingImages, ...newImages].some((img) => img.isPrimary);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("اسم المنتج مطلوب");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/products/${productId}`, {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        stock: form.stock ? Number(form.stock) : null,
        category_id: form.category_id || null,
        badge: form.badge || null,
        is_active: form.is_active,
        sort_order: form.sort_order ? Number(form.sort_order) : 0,
      });
      toast.success("تم تحديث المنتج بنجاح");
      router.push("/products");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[Object.keys(err?.response?.data?.errors || {})[0]]?.[0] || "فشل تحديث المنتج";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">المنتج غير موجود</h1>
        <p className="mb-8 text-sm text-gray-500">لم نتمكن من العثور على المنتج المطلوب</p>
        <Link href="/products" className="btn-primary">
          <ArrowRight className="h-4 w-4" /> العودة للمنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <Link href="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-accent">
        <ArrowRight className="h-4 w-4" />
        العودة إلى المنتجات
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تعديل المنتج</h1>
          <p className="mt-0.5 text-sm text-gray-500">تحديث معلومات المنتج والإعدادات</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h2 className="mb-5 text-base font-semibold text-gray-900">المعلومات الأساسية</h2>
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">اسم المنتج *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="مثال: سجاد تركي فاخر" />
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
        </div>

        <div className="card">
          <h2 className="mb-5 text-base font-semibold text-gray-900">السعر والمخزون</h2>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">السعر *</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-field pl-10" placeholder="50000" />
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
        </div>

        <div className="card">
          <h2 className="mb-5 text-base font-semibold text-gray-900">التصنيف</h2>
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
            <option value="">بدون تصنيف</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="card">
          <h2 className="mb-5 text-base font-semibold text-gray-900">الصور</h2>
          <div className="space-y-4">
            {existingImages.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-gray-400">الصور الحالية</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {existingImages.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img src={img.thumb} alt="" className="h-28 w-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      <button type="button" onClick={() => removeExistingImage(i)}
                        className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setPrimaryExisting(i)}
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
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium text-gray-400">إضافة صور جديدة</p>
              <div onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-accent hover:bg-accent-subtle">
                <Upload className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">انقر لإضافة صور</p>
                <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP — حتى 5MB للصورة</p>
                <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleNewImagesChange} />
              </div>
            </div>

            {newImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {newImages.map((img, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img src={img.preview} alt="" className="h-28 w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    <button type="button" onClick={() => removeNewImage(i)}
                      className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => setPrimaryNew(i)}
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
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
          <Link href="/products" className="btn-secondary">
            <ArrowRight className="h-4 w-4" /> إلغاء
          </Link>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
