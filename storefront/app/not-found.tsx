import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <span className="text-4xl font-bold text-gray-300">404</span>
      </div>
      <h1 className="mb-2 text-xl font-bold text-dark-900">الصفحة غير موجودة</h1>
      <p className="mb-8 text-sm text-gray-500">عذراً، الصفحة التي تبحث عنها غير متوفرة</p>
      <Link href="/" className="btn-primary">
        العودة للرئيسية <ArrowLeft size={16} />
      </Link>
    </div>
  );
}
