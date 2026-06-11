import Link from "next/link";
import { Phone, MapPin, Clock, MessageCircle, Globe } from "lucide-react";
import { Category, StoreSettings } from "@/types";

interface FooterProps {
  categories: Category[];
  store: StoreSettings | null;
}

export function Footer({ categories, store }: FooterProps) {
  const phones = store?.phones?.length ? store.phones : ["07729002266", "07730141462"];

  return (
    <footer className="bg-[#1a1410] text-gray-300">
      {/* Gold accent bar */}
      <div className="h-1 gold-gradient" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gold-gradient text-sm font-bold text-white">
                {store?.storeName?.charAt(0) || "أ"}
              </div>
              <h3 className="text-lg font-bold text-white">
                {store?.storeName || "الأطرقجي"}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              {store?.sloganLine1 || "مكان يحتاجه كل بيت — نوفر كل أنواع السجاد والمفروشات والأثاث بالتوصيل لجميع محافظات العراق."}
            </p>
            {/* Social */}
            <div className="mt-5 flex gap-2">
              {store?.facebookUrl && (
                <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-all hover:bg-brand-500 hover:text-white">
                  <Globe size={16} />
                </a>
              )}
              {store?.instagramUrl && (
                <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-all hover:bg-brand-500 hover:text-white">
                  <Globe size={16} />
                </a>
              )}
              {store?.tiktokUrl && (
                <a href={store.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-all hover:bg-brand-500 hover:text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              )}
              <a
                href={`https://wa.me/${phones[0].replace(/[^0-9]/g, "")}?text=مرحباً`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-all hover:bg-green-500 hover:text-white"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-5 text-sm font-bold tracking-wider text-white">الأقسام</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.id}`}
                    className="text-sm text-gray-400 transition-colors hover:text-brand-400 hover:pr-1"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length > 8 && (
                <li>
                  <Link href="/products" className="text-sm text-brand-400 transition-colors hover:text-brand-300">
                    عرض الكل ←
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-sm font-bold tracking-wider text-white">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Phone size={15} className="mt-0.5 shrink-0 text-brand-400" />
                <div className="space-y-1">
                  {phones.map((phone, i) => (
                    <div key={i} dir="ltr" className="text-left">
                      <a
                        href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-brand-400"
                      >
                        {phone}
                      </a>
                    </div>
                  ))}
                </div>
              </li>
              {store?.addressLine && (
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-brand-400" />
                  <span>{store.addressLine}</span>
                </li>
              )}
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Clock size={15} className="mt-0.5 shrink-0 text-brand-400" />
                <span>الرد من 9 صباحاً إلى 11 مساءً</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-sm font-bold tracking-wider text-white">روابط سريعة</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/products", label: "كل المنتجات" },
                { href: "/cart", label: "سلة التسوق" },
                { href: "/my/profile", label: "حسابي" },
                { href: "/auth/login", label: "تسجيل الدخول" },
                { href: "/auth/register", label: "إنشاء حساب" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-brand-400 hover:pr-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/5 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-gray-500 sm:flex-row sm:text-right">
            <span>© {new Date().getFullYear()} {store?.storeName || "الأطرقجي"} — جميع الحقوق محفوظة</span>
            <span className="text-gray-600">
              صنع بـ <span className="text-brand-400">♥</span> في العراق
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
