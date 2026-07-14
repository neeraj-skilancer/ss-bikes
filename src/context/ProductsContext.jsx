import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products as staticProducts } from '../data/products'

const ProductsContext = createContext(null)

// Fetches the live catalog from Firestore (via /api/products). Starts from
// the bundled static catalog so the storefront renders immediately and stays
// correct even if the API call fails — the static list is a fallback, not
// just a placeholder.
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(staticProducts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad response'))))
      .then((data) => {
        if (cancelled) return
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products)
        }
      })
      .catch(() => {
        // keep the static fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      products,
      loading,
      getProduct: (slug) => products.find((p) => p.slug === slug),
      byCategory: (handle) => (handle === 'all' ? products : products.filter((p) => p.category === handle)),
      featured: () => products.filter((p) => p.category === 'e-bikes').slice(0, 6),
    }),
    [products, loading],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
