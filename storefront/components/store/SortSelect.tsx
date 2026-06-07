"use client";

export function SortSelect({ current }: { current?: string }) {
  return (
    <select
      name="sort"
      defaultValue={current || "default"}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sort", e.target.value);
        url.searchParams.delete("page");
        window.location.href = url.toString();
      }}
      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none transition-colors focus:border-brand-500"
    >
      <option value="default">الترتيب الافتراضي</option>
      <option value="price_asc">السعر: من الأقل</option>
      <option value="price_desc">السعر: من الأعلى</option>
      <option value="name">حسب الاسم</option>
    </select>
  );
}
