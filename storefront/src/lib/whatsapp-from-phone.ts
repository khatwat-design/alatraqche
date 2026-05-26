/** يبني رابط واتساب من رقم عراقي يبدأ بـ 07 */
export function whatsappUrlFromDisplayPhone(phone: string): string {
  const d = phone.replace(/\s/g, "");
  if (d.startsWith("00964")) {
    return `https://wa.me/${d.replace(/^00964/, "964")}`;
  }
  if (d.startsWith("964")) {
    return `https://wa.me/${d}`;
  }
  if (d.startsWith("07")) {
    return `https://wa.me/964${d.slice(1)}`;
  }
  if (d.startsWith("7") && d.length >= 10) {
    return `https://wa.me/964${d}`;
  }
  return `https://wa.me/${d.replace(/^\+/, "")}`;
}
