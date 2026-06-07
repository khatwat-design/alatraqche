export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ar-IQ", {
    style: "currency",
    currency: "IQD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 30) return `منذ ${days} يوم`;
  return d.toLocaleDateString("ar-IQ");
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
