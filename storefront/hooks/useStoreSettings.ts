'use client'

import { useEffect, useState } from 'react'
import { getStoreSettings } from '@/lib/api'
import type { StoreSettings } from '@/types'

let cache: StoreSettings | null = null
let pending: Promise<StoreSettings | null> | null = null

async function loadSettings(): Promise<StoreSettings | null> {
  if (cache) return cache
  if (pending) return pending
  pending = getStoreSettings().then((data) => {
    cache = data
    pending = null
    return data
  }).catch(() => {
    pending = null
    return null
  })
  return pending
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(cache)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) {
      setSettings(cache)
      setLoading(false)
      return
    }
    let cancelled = false
    loadSettings().then((data) => {
      if (!cancelled) {
        setSettings(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { settings, loading }
}

export function getCachedStoreSettings(): StoreSettings | null {
  return cache
}
