import { createContext, useContext } from 'react'

const AdminSessionContext = createContext(null)

// value: { type: 'owner'|'staff', email, permissions }
export function AdminSessionProvider({ value, children }) {
  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminSession() {
  const ctx = useContext(AdminSessionContext)
  if (!ctx) throw new Error('useAdminSession must be used within AdminSessionProvider')
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCan(key) {
  const { type, permissions } = useAdminSession()
  if (type === 'owner') return true
  return Boolean(permissions?.[key])
}
