const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dashbord.alatraqchy.com/api/v1'

const storeTokenKey = 'alatraqchy-store-token'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(storeTokenKey)
}

export function setStoredToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(storeTokenKey, token)
  }
}

export function clearStoredToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(storeTokenKey)
  }
}

async function authFetch<T>(path: string, data: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'حدث خطأ')
  }
  return json
}

export async function requestOtp(phone: string) {
  return authFetch<{ ok: boolean; message: string }>('/auth/request-otp', { phone })
}

export async function verifyOtp(phone: string, code: string) {
  return authFetch<{
    ok: boolean
    token: string
    tokenType: string
    user: { id: number; phone: string; name: string | null }
    is_new_user: boolean
  }>('/auth/verify-otp', { phone, code })
}
