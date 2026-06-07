"use client";

import { useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, type Product } from "@/lib/products";
import { useCart } from "@/components/cart-context";
import { useProducts } from "@/lib/use-products";
import { trackAddToCart, trackViewContent } from "@/lib/pixels";
import { ProductCard } from "@/components/product-card";

export default function ProductDetailPage() {
  const { addItem } = useCart();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { products, categories, loading } = useProducts();
  const product = products.find((item) => item.id === params?.id);
  const viewContentFired = useRef(false);
  const [cartHint, setCartHint] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!product || viewContentFired.current) return;
    trackViewContent({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: 1,
    });
    viewContentFired.current = true;
  }, [product]);

  useEffect(() => {
    if (!cartHint) return;
    const t = window.setTimeout(() => setCartHint(false), 2200);
    return () => window.clearTimeout(t);
  }, [cartHint]);

  const extraPrice = product?.options?.reduce((sum, opt) => {
    const valId = selected[opt.slug];
    if (!valId) return sum;
    const val = opt.values.find((v) => String(v.id) === valId);
    return sum + (val?.priceAdjustment ?? 0);
  }, 0) ?? 0;

  const totalPrice = product ? product.price + extraPrice : 0;

  const handleOptionChange = (slug: string, valueId: string) => {
    setSelected((prev) => ({ ...prev, [slug]: valueId }));
  };

  if (!product && !loading) {
    return (
      <div className="rounded-3xl border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="text-lg font-semibold text-slate-900">المنتج غير متوفر</p>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-semibold text-slate-700"
        >
          العودة للمنتجات
        </Link>
      </div>
    );
  }

  const related = product
    ? products
        .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 4)
    : [];

  const label = product?.options?.length
    ? Object.entries(selected).map(([slug, valId]) => {
        const opt = product.options?.find((o) => o.slug === slug);
        const val = opt?.values.find((v) => String(v.id) === valId);
        return val?.value ?? "";
      }).filter(Boolean).join(", ")
    : "";

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product.id);
    trackAddToCart({
      id: product.id,
      name: product.name + (label ? ` (${label})` : ""),
      price: totalPrice,
      category: product.category,
      quantity: 1,
    });
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product.id);
    trackAddToCart({
      id: product.id,
      name: product.name + (label ? ` (${label})` : ""),
      price: totalPrice,
      category: product.category,
      quantity: 1,
    });
    setCartHint(true);
  };

  const handleRelatedBuy = (p: Product) => {
    addItem(p.id);
    trackAddToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      quantity: 1,
    });
    router.push("/checkout");
  };

  return (
    <div className="space-y-12">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted)]">
        <Link href="/" className="hover:text-[var(--color-primary)]">
          الرئيسية
        </Link>
        <span aria-hidden>›</span>
        <Link href="/products" className="hover:text-[var(--color-primary)]">
          المتجر
        </Link>
        {product ? (
          <>
            <span aria-hidden>›</span>
            <Link
              href={`/products?category=${encodeURIComponent(product.categoryId)}`}
              className="hover:text-[var(--color-primary)]"
            >
              {product.category}
            </Link>
            <span aria-hidden>›</span>
            <span className="font-medium text-stone-800">{product.name}</span>
          </>
        ) : (
          <>
            <span aria-hidden>›</span>
            <span className="font-medium text-stone-400">…</span>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div className="grid gap-6 md:grid-cols-[1.05fr,0.95fr]">
            <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-3xl bg-stone-100 p-4 md:min-h-[380px] md:p-6">
              {product ? (
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  width={576}
                  height={1024}
                  priority
                  preserveSharpness
                  className="h-auto max-h-[min(70vh,720px)] w-auto max-w-full object-contain"
                />
              ) : null}
            </div>
            <div className="space-y-4">
              {product?.badge ? (
                <span className="inline-flex rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs text-white">
                  {product.badge}
                </span>
              ) : null}
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                {product?.name ?? "جاري التحميل..."}
              </h1>
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                {product?.description ?? "نجهز تفاصيل المنتج الآن."}
              </p>
              {product?.options?.map((opt) => (
                <div key={opt.id}>
                  <p className="mb-2 text-sm font-semibold text-slate-900">{opt.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {opt.type === "color" ? (
                      opt.values.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleOptionChange(opt.slug, String(v.id))}
                          className={`h-9 w-9 rounded-full border-2 transition ${
                            selected[opt.slug] === String(v.id)
                              ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-1"
                              : "border-stone-300 hover:border-stone-400"
                          }`}
                          style={{ backgroundColor: v.value }}
                          title={v.value}
                          aria-label={v.value}
                        />
                      ))
                    ) : opt.type === "button" ? (
                      opt.values.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleOptionChange(opt.slug, String(v.id))}
                          className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                            selected[opt.slug] === String(v.id)
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                              : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                          }`}
                        >
                          {v.value}
                          {v.priceAdjustment ? (
                            <span className="mr-1 text-xs opacity-80">
                              {v.priceAdjustment > 0 ? "+" : ""}{formatCurrency(v.priceAdjustment)}
                            </span>
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <select
                        value={selected[opt.slug] ?? ""}
                        onChange={(e) => handleOptionChange(opt.slug, e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      >
                        <option value="">اختر {opt.name}</option>
                        {opt.values.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.value}
                            {v.priceAdjustment ? (
                              v.priceAdjustment > 0
                                ? ` (+${formatCurrency(v.priceAdjustment)})`
                                : ` (${formatCurrency(v.priceAdjustment)})`
                            ) : null}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <p className="text-sm text-[var(--color-muted)]">
                  {extraPrice ? "المجموع" : "السعر"}
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {product ? formatCurrency(totalPrice) : "--"}
                </p>
                {extraPrice ? (
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    السعر الأساسي: {formatCurrency(product!.price)}
                    {extraPrice > 0
                      ? ` + ${formatCurrency(extraPrice)}`
                      : ` ${formatCurrency(extraPrice)}`}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-600)] disabled:opacity-50"
                  disabled={!product}
                >
                  اشتري الآن
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 rounded-2xl border-2 border-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-amber-50 disabled:opacity-50"
                  disabled={!product}
                >
                  أضف إلى السلة
                </button>
              </div>
              {cartHint ? (
                <p className="text-center text-sm font-medium text-emerald-700" role="status">
                  تمت الإضافة إلى السلة — يمكنك إتمام الطلب من أيقونة السلة
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-semibold text-slate-900">لماذا الأطرقجي؟</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <li>مكان يحتاجه كل بيت — نوفر السجاد والمفروشات والأثاث بعناية.</li>
              <li>توصيل داخل العراق خلال 24–48 ساعة حسب المدينة.</li>
              <li>دفع عند الاستلام وتواصل لتأكيد الطلب قبل التوصيل.</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-[var(--color-primary)] p-6 text-white shadow-[var(--shadow-soft)]">
            <p className="text-sm text-white/70">ملاحظة التوصيل</p>
            <p className="mt-2 text-sm leading-6">
              يمكنك تحديد عنوانك بدقة في صفحة إتمام الطلب، مع ذكر الطابق أو وقت التوصيل المناسب.
            </p>
          </div>
          {categories.length > 0 ? (
            <div className="rounded-3xl border border-[var(--color-border)] bg-stone-50/80 p-6">
              <h3 className="text-sm font-semibold text-stone-900">أقسام أخرى</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {categories
                  .filter((c) => !product || c.id !== product.categoryId)
                  .slice(0, 4)
                  .map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/products?category=${encodeURIComponent(c.id)}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900">منتجات من نفس التصنيف</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                variant="hero"
                onBuyNow={() => handleRelatedBuy(p)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
