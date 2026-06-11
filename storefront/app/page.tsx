import { getBanners, getCategories, getProducts, getStoreSettings } from "@/lib/api";
import { BannerCarousel } from "@/components/store/BannerCarousel";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { ArrowLeft, Truck, ShieldCheck, Headphones, CreditCard, Star, Package } from "lucide-react";

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

      {/* Features Strip */}
      <section className="relative -mt-6 z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Truck, title: "توصيل سريع", desc: "لجميع محافظات العراق", color: "text-blue-600", bg: "bg-blue-50" },
            { icon: ShieldCheck, title: "جودة مضمونة", desc: "منتجات أصلية ١٠٠٪", color: "text-green-600", bg: "bg-green-50" },
            { icon: Headphones, title: "دعم متواصل", desc: "خدمة عملاء يومياً", color: "text-purple-600", bg: "bg-purple-50" },
            { icon: CreditCard, title: "دفع آمن", desc: "الدفع عند الاستلام", color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-900">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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

      {/* Stats Section */}
      {store && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl gold-gradient px-6 py-12 text-center text-white shadow-xl sm:px-12">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold md:text-3xl">{store.storeName || "الأطرقجي"}</h2>
              <div className="mt-2 text-lg text-white/80">{store.sloganLine1}</div>
              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div>
                  <div className="text-3xl font-bold">{productsData.meta.total}+</div>
                  <div className="mt-1 text-sm text-white/70">منتج</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{categories.length}+</div>
                  <div className="mt-1 text-sm text-white/70">تصنيف</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">جميع</div>
                  <div className="mt-1 text-sm text-white/70">محافظات العراق</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">٢٤</div>
                  <div className="mt-1 text-sm text-white/70">ساعة توصيل</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Detail */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-dark-900">لماذا الأطرقجي؟</h2>
            <p className="mt-2 text-sm text-gray-500">نقدم لك أفضل تجربة تسوق للسجاد والمفروشات</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Truck,
                title: "توصيل لجميع المحافظات",
                desc: "نوصل طلبك لباب بيتك في كل محافظات العراق خلال 24-48 ساعة من تاريخ الطلب.",
              },
              {
                icon: ShieldCheck,
                title: "جودة ومنتجات أصلية",
                desc: "نضمن لك جودة كل منتج. جميع منتجاتنا أصلية ومختارة بعناية لتناسب ذوقك.",
              },
              {
                icon: Headphones,
                title: "دعم فوري 24/7",
                desc: "فريق خدمة العملاء متاح يومياً من 9 صباحاً حتى 11 مساءً للرد على استفساراتك.",
              },
            ].map((item) => (
              <div key={item.title} className="group card p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl gold-gradient text-white shadow-lg transition-transform group-hover:scale-110">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-dark-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-950 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <Star className="mx-auto mb-4 h-10 w-10 text-brand-400" />
          <h2 className="text-2xl font-bold text-white md:text-3xl">جاهز لطلب سجادك أو مفروشاتك؟</h2>
          <p className="mt-3 text-gray-400">تصفح تشكيلتنا الواسعة واطلب الآن مع التوصيل المجاني</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/products" className="btn-primary text-base px-8 py-3">
              تسوق الآن
              <ArrowLeft size={18} />
            </Link>
            <a
              href={`https://wa.me/${store?.phones?.[0] || "9647729002266"}?text=مرحباً، أريد الاستفسار عن المنتجات`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base px-8 py-3"
            >
              <Headphones size={18} />
              تواصل معنا عبر واتساب
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
