"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle, Clock, XCircle, Truck, ChevronDown } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface OrderDetail {
  id: number;
  invoice_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  customer_city?: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  notes?: string;
  discount?: number;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  created_at: string;
}

const statusFlow = ["pending", "confirmed", "processing", "shipped", "delivered"];

const statusConfig: Record<string, { label: string; badge: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending: { label: "قيد الانتظار", badge: "badge-yellow", icon: Clock, color: "text-yellow-600" },
  confirmed: { label: "مؤكد", badge: "badge-blue", icon: CheckCircle, color: "text-blue-600" },
  processing: { label: "قيد المعالجة", badge: "badge-purple", icon: Package, color: "text-purple-600" },
  shipped: { label: "تم الشحن", badge: "badge-blue", icon: Truck, color: "text-blue-600" },
  delivered: { label: "تم التوصيل", badge: "badge-green", icon: CheckCircle, color: "text-green-600" },
  cancelled: { label: "ملغي", badge: "badge-red", icon: XCircle, color: "text-red-600" },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);

  const fetchOrder = () => {
    setLoading(true);
    api.get(`/admin/orders/${id}`).then(({ data }) => {
      setOrder(data.order || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setChangingStatus(true);
    setStatusDropdown(false);
    try {
      await api.put(`/admin/orders/${id}`, { status: newStatus });
      toast.success("تم تحديث حالة الطلب بنجاح");
      fetchOrder();
    } catch {
      toast.error("فشل تحديث الحالة");
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center animate-fade-in">
        <XCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="text-gray-500">الطلب غير موجود</p>
        <Link href="/orders" className="btn-primary mt-4 inline-flex">عودة للطلبات</Link>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const currentStatusIndex = statusFlow.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  const nextStatuses = isCancelled || isDelivered ? [] : statusFlow.slice(currentStatusIndex + 1);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href="/orders" className="btn-ghost p-1.5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">طلب #{order.invoice_id}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString("ar-IQ", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isCancelled && !isDelivered && (
            <div className="relative">
              <button
                onClick={() => setStatusDropdown(!statusDropdown)}
                disabled={changingStatus}
                className="btn-primary"
              >
                {changingStatus ? "جارٍ..." : "تحديث الحالة"}
                <ChevronDown className="h-4 w-4" />
              </button>
              {statusDropdown && (
                <div className="absolute left-0 top-full z-20 mt-1 w-44 animate-fade-in overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  {nextStatuses.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">لا توجد حالات متاحة</div>
                  ) : (
                    nextStatuses.map((s) => {
                      const sc = statusConfig[s];
                      const Icon = sc.icon;
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Icon className={`h-4 w-4 ${sc.color}`} />
                          {sc.label}
                        </button>
                      );
                    })
                  )}
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => handleStatusChange("cancelled")}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      إلغاء الطلب
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <span className={`badge text-sm px-3 py-1 ${statusConfig[order.status]?.badge || "badge-yellow"}`}>
            <StatusIcon className="ml-1.5 inline h-3.5 w-3.5" />
            {statusConfig[order.status]?.label || order.status}
          </span>
        </div>
      </div>

      {/* Status Timeline (clickable) */}
      {!isCancelled && (
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            {statusFlow.map((s, i) => {
              const StepIcon = statusConfig[s].icon;
              const isActive = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;
              const canClick = !isDelivered && !isCancelled && (i === currentStatusIndex + 1 || (currentStatusIndex >= 2 && i > currentStatusIndex));

              const content = (
                <div className="flex flex-1 items-center">
                  <div
                    className={`flex flex-col items-center ${canClick ? "cursor-pointer" : ""}`}
                    onClick={() => canClick && handleStatusChange(s)}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                        isActive
                          ? "gold-gradient text-white shadow-sm"
                          : "bg-gray-100 text-gray-400"
                      } ${isCurrent ? "ring-2 ring-accent/30 ring-offset-2" : ""} ${
                        canClick ? "hover:scale-110" : ""
                      }`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                      isActive ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {statusConfig[s].label}
                    </span>
                  </div>
                  {i < statusFlow.length - 1 && (
                    <div className={`mx-2 h-0.5 flex-1 rounded-full ${
                      i < currentStatusIndex ? "bg-accent" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );

              return <div key={s} className="flex flex-1 items-center">{content}</div>;
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Package className="h-4 w-4 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">المنتجات</h2>
            </div>
            <table className="table-base">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>السعر</th>
                  <th>الكمية</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium text-gray-900">{item.name}</td>
                    <td className="text-gray-600">{formatPrice(item.price)}</td>
                    <td className="text-gray-600">{item.quantity}</td>
                    <td className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                <MapPin className="h-3.5 w-3.5 text-accent" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">معلومات العميل</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <p className="text-gray-500" dir="ltr">{order.customer_phone}</p>
              {order.customer_city && <p className="text-gray-500">{order.customer_city}</p>}
              {order.customer_address && <p className="text-gray-500">{order.customer_address}</p>}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                <CreditCard className="h-3.5 w-3.5 text-accent" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">ملخص الطلب</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">المجموع الفرعي</span>
                <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الخصم</span>
                  <span className="font-medium text-green-600">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">التوصيل</span>
                <span className="font-medium text-gray-900">{formatPrice(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="font-semibold text-gray-900">الإجمالي</span>
                <span className="font-bold gold-text">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-500">حالة الدفع</span>
                <span className={`badge ${order.payment_status === "paid" ? "badge-green" : "badge-yellow"}`}>
                  {order.payment_status === "paid" ? "مدفوع" : "غير مدفوع"}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex justify-between">
                  <span className="text-gray-500">طريقة الدفع</span>
                  <span className="font-medium text-gray-900">{order.payment_method === "cod" ? "الدفع عند الاستلام" : order.payment_method}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="card">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">ملاحظات</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
