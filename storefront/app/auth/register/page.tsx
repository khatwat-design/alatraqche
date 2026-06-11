"use client";

import { useRouter } from "next/navigation";
import { setStoredToken } from "@/lib/api";
import PhoneAuthForm from "@/components/auth/PhoneAuthForm";

export default function RegisterPage() {
  const router = useRouter();

  function handleSuccess(result: { token: string; user: { id: number; phone: string; name: string | null }; isNew: boolean }) {
    setStoredToken(result.token);
    router.push("/orders");
  }

  return <PhoneAuthForm onSuccess={handleSuccess} title="إنشاء حساب" subtitle="لتتبع طلباتك والاستفادة من العروض الحصرية" />;
}
