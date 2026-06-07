'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, SelectedOption } from '@/types'

function computeKey(productId: string, options: SelectedOption[]): string {
  const optStr = options.map(o => `${o.optionId}:${o.valueId}`).sort().join(',')
  return `${productId}|${optStr}`
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, options?: SelectedOption[]) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, options = []) => {
        set((state) => {
          const key = computeKey(product.id, options)
          const existing = state.items.find(i => {
            const ek = computeKey(i.product.id, i.selectedOptions)
            return ek === key
          })
          if (existing) {
            return {
              items: state.items.map(i => {
                const ek = computeKey(i.product.id, i.selectedOptions)
                return ek === key ? { ...i, quantity: i.quantity + quantity } : i
              }),
            }
          }
          return { items: [...state.items, { product, quantity, selectedOptions: options }] }
        })
      },

      removeItem: (cartKey) => {
        set((state) => ({
          items: state.items.filter(i => computeKey(i.product.id, i.selectedOptions) !== cartKey),
        }))
      },

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartKey)
          return
        }
        set((state) => ({
          items: state.items.map(i => {
            const ek = computeKey(i.product.id, i.selectedOptions)
            return ek === cartKey ? { ...i, quantity } : i
          }),
        }))
      },

      clearCart: () => set({ items: [] }),

      total: () => {
        return get().items.reduce((sum, item) => {
          const adj = item.selectedOptions.reduce((a, o) => {
            const opt = item.product.options.find(p => p.id === o.optionId)
            const val = opt?.values.find(v => v.id === o.valueId)
            return a + (val?.priceAdjustment ?? 0)
          }, 0)
          return sum + (item.product.price + adj) * item.quantity
        }, 0)
      },

      count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'alatraqchy-cart' }
  )
)
