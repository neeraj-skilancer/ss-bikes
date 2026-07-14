import { useState } from 'react'
import { CheckCircle2, MapPin, Clock, Bike } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'

export default function TestDrive() {
  const { byCategory } = useProducts()
  const bikes = byCategory('e-bikes')
  const [sent, setSent] = useState(false)

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Try before you buy</span>
          <h1>Book a Free Test Drive</h1>
          <p>
            Experience an SS Bikes e-cycle for yourself. Pick a model, choose a time, and we'll set
            up a no-obligation test ride near you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'grid', gap: 40, gridTemplateColumns: '1fr' }}>
          <div className="values">
            <div className="value">
              <div className="value__ico">
                <Bike size={22} />
              </div>
              <h3>Ride any model</h3>
              <p>Test the exact bike you're considering — from the Cosmos to the CargoX.</p>
            </div>
            <div className="value">
              <div className="value__ico">
                <MapPin size={22} />
              </div>
              <h3>Near you</h3>
              <p>We'll arrange your ride at the nearest SS Bikes dealer or experience point.</p>
            </div>
            <div className="value">
              <div className="value__ico">
                <Clock size={22} />
              </div>
              <h3>At your time</h3>
              <p>Choose a slot that works for you, any day from Monday to Saturday.</p>
            </div>
          </div>

          <div className="form-card" style={{ maxWidth: 760, marginInline: 'auto', width: '100%' }}>
            {sent ? (
              <div className="form-ok">
                <div className="form-ok__ico">
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem' }}>Test drive booked!</h3>
                <p style={{ color: 'var(--muted)', marginTop: 10 }}>
                  We've received your request. Our team will call you to confirm your slot and
                  location. See you soon — be electrified! ⚡
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
                  <label>Phone number</label>
                  <input required type="tel" placeholder="+91" />
                </div>
                <div className="input">
                  <label>Choose a model</label>
                  <select defaultValue="">
                    <option value="" disabled>
                      Select a bike
                    </option>
                    {bikes.map((b) => (
                      <option key={b.slug} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input">
                  <label>Preferred date</label>
                  <input type="date" required />
                </div>
                <div className="input full">
                  <label>City / area</label>
                  <input required placeholder="Where should we set up your ride?" />
                </div>
                <div className="input full">
                  <button className="btn btn--primary btn--block" type="submit">
                    Book my test drive
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
