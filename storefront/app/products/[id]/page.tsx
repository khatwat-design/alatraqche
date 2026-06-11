import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getProduct, formatPrice } from "@/lib/api";
import { AddToCartButton } from "./AddToCartButton";
import { OptionSelector } from "./OptionSelector";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "المنتج غير موجود" };
  return { title: product.name };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="transition-colors hover:text-brand-600">الرئيسية</Link>
        <span>/</span>
        <Link href="/products" className="transition-colors hover:text-brand-600">المنتجات</Link>
        <span>/</span>
        <span className="text-dark-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
            {product.images?.[0]?.url ? (
              <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            ) : product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl text-gray-300">📷</div>
            )}
            {product.badge && (
              <div className="absolute right-4 top-4">
                <span className="badge-gold">{product.badge}</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-colors hover:border-brand-500"
                >
                  <Image src={img.thumb} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-1 text-sm text-gray-400">{product.category}</p>
            <h1 className="text-2xl font-bold leading-tight text-dark-900 lg:text-3xl">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-dark-900">{formatPrice(product.price)}</span>
          </div>

          {product.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-dark-900">الوصف</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{product.description}</p>
            </div>
          )}

          {product.options && product.options.length > 0 && <OptionSelector product={product} />}

          <div className="pt-2">
            <AddToCartButton product={product} />
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-5">
            {[
              { text: "توصيل لجميع محافظات العراق — خلال 24-48 ساعة", icon: "🚚" },
              { text: "الدفع عند الاستلام — لا دفع مسبق", icon: "💳" },
              { text: "ضمان الجودة — منتجات أصلية 100%", icon: "✅" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-gray-500">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
