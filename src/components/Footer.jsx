import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import logo from '../assets/logo.png'

const Facebook = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...p}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
  </svg>
)
const Instagram = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)
const Twitter = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...p}>
    <path d="M18.9 2H22l-7.5 8.6L23 22h-6.9l-5.4-7-6.2 7H1.4l8-9.2L1 2h7l4.9 6.5L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" />
  </svg>
)

export default function Footer() {
  const year = 2026
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="brand">
              <img className="brand__logo brand__logo--invert" src={logo} alt="SS Bikes" />
            </div>
            <p>
              India's revolutionary range of electric cycles. Zero-emission, long-lasting and built
              to transform short-distance commuting. Be electrified — the revolution has just begun.
            </p>
            <div className="footer__socials">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
                <Facebook />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
                <Instagram />
              </a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noreferrer">
                <Twitter />
              </a>
            </div>
          </div>

          <div>
            <h4>Shop</h4>
            <Link to="/shop/e-bikes">E-Bikes</Link>
            <Link to="/shop/accessories">Accessories</Link>
            <Link to="/shop/all">New Launches</Link>
            <Link to="/test-drive">Book a Test Drive</Link>
          </div>

          <div>
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/dealers">Find a Dealer</Link>
            <Link to="/dealer-network">Become a Dealer</Link>
            <Link to="/about">Our Mission</Link>
            <a href="mailto:support@ssbikes.in">Support</a>
          </div>

          <div>
            <h4>Get in touch</h4>
            <a href="mailto:support@ssbikes.in">
              <Mail size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: '-2px' }} />
              support@ssbikes.in
            </a>
            <a href="tel:+919999999999">
              <Phone size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: '-2px' }} />
              +91 99999 99999
            </a>
            <a href="/shop/e-bikes">Mon–Sat · 10am–7pm</a>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} ssbikes.in — All rights reserved.</span>
          <span>Made in India 🇮🇳 · Refund · Privacy · Terms of Service</span>
        </div>
      </div>
    </footer>
  )
}
