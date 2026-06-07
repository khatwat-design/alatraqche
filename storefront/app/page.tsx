import { getBanners, getCategories, getProducts, getStoreSettings } from "@/lib/api";
import { BannerCarousel } from "@/components/store/BannerCarousel";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Phone } from "lucide-react";

export default async function HomePage() {
  const [banners, categories, productsData, store] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts({ page: 1 }),
    getStoreSettings(),
  ]);

  const featuredProducts = productsData.products.slice(0, 8);

  return (
    <>
      <BannerCarousel banners={banners} />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm">
            <svg className="mb-3 h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            <h3 className="text-sm font-semibold text-dark-900">توصيل سريع</h3>
            <p className="mt-1 text-xs text-gray-500">لجميع محافظات العراق</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm">
            <svg className="mb-3 h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <h3 className="text-sm font-semibold text-dark-900">جودة مضمونة</h3>
            <p className="mt-1 text-xs text-gray-500">منتجات أصلية ١٠٠٪</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm">
            <Phone className="mb-3 h-8 w-8 text-brand-500" />
            <h3 className="text-sm font-semibold text-dark-900">دعم متواصل</h3>
            <p className="mt-1 text-xs text-gray-500">خدمة عملاء على مدار اليوم</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm">
            <ShoppingBag className="mb-3 h-8 w-8 text-brand-500" />
            <h3 className="text-sm font-semibold text-dark-900">دفع آمن</h3>
            <p className="mt-1 text-xs text-gray-500">الدفع عند الاستلام</p>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-dark-900">الأقسام</h2>
            <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              الكل <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex shrink-0 flex-col items-center gap-2 rounded-2xl bg-white px-6 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-600">
                  {cat.name.charAt(0)}
                </div>
                <span className="whitespace-nowrap text-sm font-medium text-dark-900">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-dark-900">منتجات مميزة</h2>
            <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              عرض الكل <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-dark-950 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold md:text-3xl">
            {store?.sloganLine1 || "الأطرقجي"}
          </h2>
          <p className="mt-3 text-gray-400">
            {store?.sloganLine2 || "مكان يحتاجه كل بيت، نوفر كل أنواع السجاد والمفروشات والأثاث"}
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            تسوق الآن
            <ShoppingBag size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
