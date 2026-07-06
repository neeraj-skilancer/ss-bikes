# SS Bikes — Storefront

A React + Vite rebuild of [ssbikes.in](https://ssbikes.in/), India's electric-cycle store.
Real product data, specs, pricing and photography are sourced from the live Shopify
storefront (`products.json` + Shopify CDN images).

## Features

- **Home** — hero, trust strip, featured lineup, feature banner, value props, reviews, CTA
- **Shop** — `/shop/:handle` collection pages (E-Bikes / Accessories / Everything) with filter + sort
- **Product detail** — `/product/:slug` with colour variants, spec grid, add-to-cart, related items
- **Cart** — slide-out drawer, quantity controls, persisted to `localStorage`
- **Checkout** — contact/delivery form with live order summary (demo, no payment)
- **About**, **Dealer Network** (application form), **Book Test Drive** (booking form)
- Fully responsive with a mobile nav drawer

## Tech

- React 19 + Vite 8
- react-router-dom (client routing)
- lucide-react (icons)
- Plain CSS with design tokens in `src/index.css`

## Structure

```
src/
  data/products.js      # catalog: products, prices, specs, image URLs, helpers
  context/StoreContext  # cart state + localStorage
  lib/colors.js         # colour-name → swatch hex
  components/           # Navbar, Footer, CartDrawer, ProductCard
  pages/                # Home, Shop, ProductDetail, About, DealerNetwork, TestDrive, Checkout, NotFound
```

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to /dist
npm run lint     # oxlint
```

## Notes

- Product imagery is hot-linked from the live Shopify CDN so it matches the real store.
  To go fully self-hosted, download the images into `src/assets` and update the URLs in
  `src/data/products.js`.
- The forms and checkout are front-end demos — wire them to your backend / Shopify
  Storefront API or a form service to make them live.
