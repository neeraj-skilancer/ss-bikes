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

// each cart line: { slug, color, qty }
function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { slug, color, qty = 1 } = action
      const existing = state.find((l) => l.slug === slug && l.color === color)
      if (existing) {
        return state.map((l) =>
          l.slug === slug && l.color === color ? { ...l, qty: l.qty + qty } : l,
        )
      }
      return [...state, { slug, color, qty }]
    }
    case 'setQty':
      return state
        .map((l) =>
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
          const product = products.find((p) => p.slug === l.slug)
          if (!product) return null
          return { ...l, product, lineTotal: product.price * l.qty }
        })
        .filter(Boolean),
    [cart, products],
  )

  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0)

  const value = {
    cart,
    lines,
    count,
    subtotal,
    cartOpen,
    setCartOpen,
    addToCart: (slug, color, qty = 1) => {
      dispatch({ type: 'add', slug, color, qty })
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
