// Sends a virtual pageview to Google Analytics (gtag.js) on SPA route changes.
// The base gtag.js snippet in index.html only fires once on initial load —
// HashRouter navigation doesn't reload the page, so without this GA would
// only ever see a single pageview no matter how many pages are visited.
export function trackPageview(path) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}
