export type Category = {
  id: string;
  name: string;
  description?: string;
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  badge?: string;
  category: string;
  /** يطابق `id` في `data/categories.json` */
  categoryId: string;
  image: string;
  isVisible?: boolean;
};

export type SortKey = "default" | "price-asc" | "price-desc" | "name";

export const sortProducts = (
  list: Product[],
  sort: SortKey,
): Product[] => {
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  return copy;
};

export const filterProductsByQuery = (
  list: Product[],
  q: string,
): Product[] => {
  const t = q.trim().toLowerCase();
  if (!t) return list;
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(t) ||
      p.description.toLowerCase().includes(t) ||
      p.category.toLowerCase().includes(t) ||
      p.categoryId.toLowerCase().includes(t),
  );
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-IQ", {
    style: "currency",
    currency: "IQD",
    maximumFractionDigits: 0,
  }).format(amount);
