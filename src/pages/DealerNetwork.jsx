import { useState } from 'react'
import { CheckCircle2, TrendingUp, MapPin, HeadphonesIcon, Handshake } from 'lucide-react'

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'High-margin business',
    text: 'Attractive dealer margins on a fast-growing e-mobility category with repeat spares demand.',
  },
  {
    icon: MapPin,
    title: 'Exclusive territory',
    text: 'Get a protected catchment area so you can build your local SS Bikes brand without overlap.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Full support',
    text: 'Marketing material, sales training, service know-how and priority stock replenishment.',
  },
  {
    icon: Handshake,
    title: 'Low investment',
    text: 'A lean setup with flexible onboarding — start small and scale as demand in your city grows.',
  },
]

export default function DealerNetwork() {
  const [sent, setSent] = useState(false)

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Partner with us</span>
          <h1>Join the SS Bikes Dealer Network</h1>
          <p>
            Bring clean, affordable electric mobility to your city. Become an authorised SS Bikes
            dealer and grow with India's e-cycle revolution.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="values" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {BENEFITS.map((b) => (
              <div className="value" key={b.title}>
                <div className="value__ico">
                  <b.icon size={22} />
                </div>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="section-head section-head--center" style={{ marginInline: 'auto' }}>
            <span className="eyebrow">Apply now</span>
            <h2>Become a dealer</h2>
            <p>Fill in your details and our partnerships team will reach out within 48 hours.</p>
          </div>

          <div className="form-card">
            {sent ? (
              <div className="form-ok">
                <div className="form-ok__ico">
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem' }}>Application received!</h3>
                <p style={{ color: 'var(--muted)', marginTop: 10 }}>
                  Thanks for your interest in partnering with SS Bikes. Our team will be in touch
                  shortly.
                </p>
              </div>
            ) : (
              <form
                className="form-grid"
                onSubmit={(e) => {
                  e.preventDefault()
                  setSent(true)
                }}
              >
                <div className="input">
                  <label>Full name</label>
                  <input required placeholder="Your name" />
                </div>
                <div className="input">
                  <label>Business / firm name</label>
                  <input placeholder="Optional" />
                </div>
                <div className="input">
                  <label>Phone number</label>
                  <input required type="tel" placeholder="+91" />
                </div>
                <div className="input">
                  <label>Email</label>
                  <input required type="email" placeholder="you@example.com" />
                </div>
                <div className="input">
                  <label>City</label>
                  <input required placeholder="City" />
                </div>
                <div className="input">
                  <label>State</label>
                  <input required placeholder="State" />
                </div>
                <div className="input full">
                  <label>Tell us about yourself</label>
                  <textarea rows={4} placeholder="Existing business, investment capacity, etc." />
                </div>
                <div className="input full">
                  <button className="btn btn--primary btn--block" type="submit">
                    Submit application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
