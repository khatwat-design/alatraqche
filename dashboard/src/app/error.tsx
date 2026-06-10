"use client";

import { AlertCircle } from "lucide-react";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">حدث خطأ غير متوقع</h1>
        <p className="mb-8 text-sm text-gray-500">نأسف للإزعاج، يرجى المحاولة مرة أخرى</p>
        <button onClick={reset} className="btn-primary">
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
