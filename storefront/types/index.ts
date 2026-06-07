export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  badge: string | null
  category: string
  categoryId: string
  image: string
  images: ProductImage[]
  isVisible: boolean
  options: ProductOption[]
}

export interface ProductImage {
  url: string
  large: string
  thumb: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  image: string
}

export interface ProductOption {
  id: number
  name: string
  slug: string
  type: string
  values: ProductOptionValue[]
}

export interface ProductOptionValue {
  id: number
  value: string
  priceAdjustment: number
}

export interface CartItem {
  product: Product
  quantity: number
  selectedOptions: SelectedOption[]
}

export interface SelectedOption {
  optionId: number
  valueId: number
  value: string
}

export interface Banner {
  id: number
  title: string | null
  image: string
  linkUrl: string | null
}

export interface StoreSettings {
  storeName: string
  sloganLine1: string | null
  sloganLine2: string | null
  sloganHighlightPhrase: string | null
  metaTitle: string | null
  headerBackground: string | null
  footerBackground: string | null
  primaryColor: string | null
  logoUrl: string | null
  addressLine: string | null
  mapLat: string | null
  mapLng: string | null
  mapEmbedUrl: string | null
  phones: string[]
  instagramUrl: string | null
  facebookUrl: string | null
  tiktokUrl: string | null
  metaPixelId: string | null
  tiktokPixelId: string | null
  googleAnalyticsId: string | null
  snapchatPixelId: string | null
  twitterPixelId: string | null
  customHeadSnippet: string | null
}

export interface CouponValidation {
  ok: boolean
  code: string
  type: string
  value: number
  discount: number
  maxDiscount: number | null
  minOrder: number | null
}

export interface OrderResponse {
  ok: boolean
  invoiceId: string
  orderId: number
  storeToken: string | null
  tokenType: string | null
}

export interface PaginatedProducts {
  products: Product[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface CustomerInfo {
  id: number
  name: string
  phone: string
  email: string | null
}

export interface OrderListItem {
  id: number
  invoiceId: string
  status: string
  statusLabel: string
  total: number
  totalItems: number
  createdAt: string
}

export interface OrderDetail {
  id: number
  invoiceId: string
  status: string
  statusLabel: string
  customerName: string
  customerPhone: string
  customerCity: string | null
  customerAddress: string | null
  subtotal: number
  deliveryFee: number
  total: number
  totalItems: number
  channel: string | null
  createdAt: string
  updatedAt: string | null
  items: OrderItemDetail[]
}

export interface OrderItemDetail {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface FilterState {
  category?: string
  sort: 'default' | 'price_asc' | 'price_desc' | 'name'
  search?: string
  page: number
}
