import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <span className="text-3xl font-bold text-gray-300">404</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">الصفحة غير موجودة</h1>
        <p className="mb-8 text-sm text-gray-500">عذراً، الصفحة التي تبحث عنها غير متوفرة</p>
        <Link href="/" className="btn-primary">
          <ArrowRight className="h-4 w-4" /> العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
