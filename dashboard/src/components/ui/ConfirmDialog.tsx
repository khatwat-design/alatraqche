"use client";

import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmText = "تأكيد", cancelText = "إلغاء",
  loading = false, danger = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">{cancelText}</button>
          <button onClick={onConfirm} disabled={loading} className={danger ? "btn-danger" : "btn-primary"}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "جارٍ التنفيذ..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
