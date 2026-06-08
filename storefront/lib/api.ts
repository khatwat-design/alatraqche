import type { Product, Category, PaginatedProducts, FilterState, Banner, StoreSettings, CouponValidation, OrderResponse, CustomerInfo, OrderListItem, OrderDetail } from '@/types'

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

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  if (options?.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, { headers, cache: 'no-store', ...options })
  if (!res.ok) {
    const body = await res.text()
    let msg: string
    try {
      const json = JSON.parse(body)
      msg = json.message || json.errors || `API error ${res.status}`
    } catch {
      msg = body || `API error ${res.status}`
    }
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return res.json()
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await apiFetch<Category[]>('/categories')
  } catch {
    return []
  }
}

export async function getProducts(filters: Partial<FilterState> = {}): Promise<PaginatedProducts> {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.sort && filters.sort !== 'default') params.set('sort', filters.sort)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  params.set('per_page', '24')

  try {
    return await apiFetch<PaginatedProducts>(`/products?${params}`)
  } catch {
    return { products: [], meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 } }
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const data = await apiFetch<{ product: Product }>(`/products/${encodeURIComponent(id)}`)
    return data.product
  } catch {
    return null
  }
}

export async function getBanners(): Promise<Banner[]> {
  try {
    return await apiFetch<Banner[]>('/banners')
  } catch {
    return []
  }
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    return await apiFetch<StoreSettings>('/store')
  } catch {
    return null
  }
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidation | null> {
  try {
    return await apiFetch<CouponValidation>(`/coupons/validate/${encodeURIComponent(code)}?subtotal=${subtotal}`)
  } catch {
    return null
  }
}

export async function placeOrder(orderData: {
  customer: {
    name: string
    phone: string
    city?: string
    address?: string
    carType?: string
    carModel?: string
    notes?: string
    paymentMethod?: string
  }
  items: {
    id: string
    name: string
    price: number
    quantity: number
    subtotal: number
    options?: { optionId: number; valueId: number; value: string }[]
  }[]
  summary: {
    subtotal: number
    deliveryFee?: number
    total: number
    totalItems: number
  }
  coupon?: string
  channel?: string
}): Promise<OrderResponse | null> {
  try {
    return await apiFetch<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  } catch {
    return null
  }
}

export async function registerCustomer(data: { name: string; phone: string; password: string; password_confirmation: string }) {
  return apiFetch<{ ok: boolean; token: string; tokenType: string; customer: CustomerInfo }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function loginCustomer(data: { phone: string; password: string }) {
  return apiFetch<{ ok: boolean; token: string; tokenType: string; customer: CustomerInfo }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function logoutCustomer() {
  return apiFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' })
}

export async function getMe(): Promise<CustomerInfo | null> {
  try {
    const data = await apiFetch<{ ok: boolean; customer: CustomerInfo }>('/auth/me')
    return data.customer
  } catch {
    return null
  }
}

export async function getMyOrders(page = 1): Promise<{ data: OrderListItem[]; meta: { current_page: number; last_page: number; per_page: number; total: number } } | null> {
  try {
    return await apiFetch(`/my/orders?page=${page}`)
  } catch {
    return null
  }
}

export async function getMyOrder(invoiceId: string): Promise<OrderDetail | null> {
  try {
    const data = await apiFetch<{ ok: boolean; order: OrderDetail }>(`/my/orders/${encodeURIComponent(invoiceId)}`)
    return data.order
  } catch {
    return null
  }
}

export async function checkStoreStatus(lastTs = 0): Promise<{ ts: number; type: string }> {
  return apiFetch(`/store-status?ts=${lastTs}`)
}

export const IRAQI_CITIES = [
  'بغداد', 'البصرة', 'أربيل', 'السليمانية', 'دهوك',
  'نينوى', 'كركوك', 'الأنبار', 'ديالى', 'بابل',
  'واسط', 'المثنى', 'ذي قار', 'القادسية', 'ميسان',
  'صلاح الدين', 'كربلاء', 'النجف',
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
