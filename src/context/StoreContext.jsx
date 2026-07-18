import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { useProducts } from './ProductsContext'

const StoreContext = createContext(null)

const STORAGE_KEY = 'ss-bikes-cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// each cart line: { slug, color, qty, dealerSlug?, dealerName?, dealerPrice? }
// A cart can only hold lines from ONE source at a time — either the main
// storefront, or a single dealer's store — enforced in addToCart below.
function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { slug, color, qty = 1, dealerSlug = null, dealerName = null, dealerPrice = null } = action
      const existing = state.find((l) => l.slug === slug && l.color === color && l.dealerSlug === dealerSlug)
      if (existing) {
        return state.map((l) =>
          l.slug === slug && l.color === color && l.dealerSlug === dealerSlug
            ? { ...l, qty: l.qty + qty }
            : l,
        )
      }
      return [...state, { slug, color, qty, dealerSlug, dealerName, dealerPrice }]
    }
    case 'setQty':
      return state.map((l) =>
        l.slug === action.slug && l.color === action.color
          ? { ...l, qty: Math.max(1, action.qty) }
          : l,
      )
    case 'remove':
      return state.filter((l) => !(l.slug === action.slug && l.color === action.color))
    case 'clear':
      return []
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const { products } = useProducts()
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadCart)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const lines = useMemo(
    () =>
      cart
        .map((l) => {
          const base = products.find((p) => p.slug === l.slug)
          if (!base) return null
          // Dealer purchases keep the price shown on the dealer's page (which may
          // differ from the base catalog price) rather than re-deriving it live.
          const product = l.dealerSlug && l.dealerPrice != null ? { ...base, price: l.dealerPrice } : base
          return { ...l, product, lineTotal: product.price * l.qty }
        })
        .filter(Boolean),
    [cart, products],
  )

  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0)

  // The dealer the current cart is scoped to, if any — null for the main storefront.
  const dealer = cart[0]?.dealerSlug ? { slug: cart[0].dealerSlug, name: cart[0].dealerName } : null

  const value = {
    cart,
    lines,
    count,
    subtotal,
    dealer,
    cartOpen,
    setCartOpen,
    // dealer: optional { slug, name, price } — scopes this add to a specific dealer's store.
    addToCart: (slug, color, qty = 1, dealer = null) => {
      const dealerSlug = dealer?.slug || null
      const dealerName = dealer?.name || null
      const dealerPrice = dealer?.price ?? null
      const currentScope = cart[0]?.dealerSlug || null

      if (cart.length > 0 && currentScope !== dealerSlug) {
        const fromLabel = currentScope ? `${cart[0].dealerName || 'a dealer'}'s store` : 'the main SS Bikes store'
        const toLabel = dealerSlug ? `${dealerName}'s store` : 'the main SS Bikes store'
        const ok = window.confirm(
          `Your cart has items from ${fromLabel}. Adding this item will clear it and start a new order from ${toLabel}. Continue?`,
        )
        if (!ok) return
        dispatch({ type: 'clear' })
      }

      dispatch({ type: 'add', slug, color, qty, dealerSlug, dealerName, dealerPrice })
      setCartOpen(true)
    },
    setQty: (slug, color, qty) => dispatch({ type: 'setQty', slug, color, qty }),
    remove: (slug, color) => dispatch({ type: 'remove', slug, color }),
    clear: () => dispatch({ type: 'clear' }),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
