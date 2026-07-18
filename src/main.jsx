import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { StoreProvider } from './context/StoreContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProductsProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </ProductsProvider>
    </BrowserRouter>
  </StrictMode>,
)
