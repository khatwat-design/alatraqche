"use client";

import { useRouter } from "next/navigation";
import { setStoredToken } from "@/lib/api";
import PhoneAuthForm from "@/components/auth/PhoneAuthForm";

export default function LoginPage() {
  const router = useRouter();

  function handleSuccess(result: { token: string; user: { id: number; phone: string; name: string | null }; isNew: boolean }) {
    setStoredToken(result.token);
    router.push("/orders");
  }

  return <PhoneAuthForm onSuccess={handleSuccess} title="تسجيل الدخول" subtitle="لتتبع طلباتك السابقة والاستفادة من العروض" />;
}
