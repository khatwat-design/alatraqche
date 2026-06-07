import Link from 'next/link'
import { Phone, MapPin, Clock } from 'lucide-react'
import { Category } from '@/types'

interface FooterProps {
  categories: Category[]
}

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="bg-[#1a1410] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">الأطرقجي</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              مكان يحتاجه كل بيت — نوفر كل أنواع السجاد والمفروشات والأثاث بالتوصيل لجميع محافظات العراق.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">الأقسام</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/products?category=${cat.id}`}
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone size={14} className="text-amber-400 flex-shrink-0" />
                <div>
                  <div>07729002266</div>
                  <div>07730141462</div>
                </div>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin size={14} className="text-amber-400 flex-shrink-0" />
                <span>بغداد، العراق</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={14} className="text-amber-400 flex-shrink-0" />
                <span>الرد من 9 صباحاً إلى 11 مساءً</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">الرئيسية</Link></li>
              <li><Link href="/products" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">كل المنتجات</Link></li>
              <li><Link href="/cart" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">سلة التسوق</Link></li>
              <li><Link href="/auth/login" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">تسجيل الدخول</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} الأطرقجي — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  )
}
