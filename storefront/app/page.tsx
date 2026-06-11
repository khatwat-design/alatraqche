import { getBanners, getCategories, getProducts } from "@/lib/api";
import { BannerCarousel } from "@/components/store/BannerCarousel";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

export default async function HomePage() {
  const [banners, categories, productsData] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts({ page: 1 }),
  ]);

  const featuredProducts = productsData.products.slice(0, 8);

  return (
    <>
      <BannerCarousel banners={banners} />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-dark-900">الأقسام</h2>
              <p className="mt-1 text-sm text-gray-500">تصفح حسب التصنيف</p>
            </div>
            <Link
              href="/products"
              className="btn-secondary text-sm"
            >
              عرض الكل
              <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group flex shrink-0 flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-8 py-5 shadow-sm transition-all hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl gold-gradient text-xl font-bold text-white shadow-sm transition-transform group-hover:scale-110">
                  {cat.image ? (
                    <img src={cat.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-7 w-7" />
                  )}
                </div>
                <span className="whitespace-nowrap text-sm font-medium text-dark-900 group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50/80 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-dark-900">منتجات مميزة</h2>
                <p className="mt-1 text-sm text-gray-500">اختر من بين أفضل منتجاتنا</p>
              </div>
              <Link
                href="/products"
                className="btn-primary text-sm"
              >
                عرض الكل
                <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product, idx) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
