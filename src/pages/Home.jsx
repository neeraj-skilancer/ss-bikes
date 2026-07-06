import { Link } from 'react-router-dom'
import {
  Truck,
  BatteryCharging,
  ShieldCheck,
  Leaf,
  Wrench,
  Star,
  ArrowRight,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import Hero from '../components/Hero'
import { featured, img } from '../data/products'

const REVIEWS = [
  {
    text: 'Switched my daily 8 km office commute to the Cosmos. Zero petrol, silent ride and the range easily lasts two days. Best value e-cycle in India.',
    name: 'Rahul Mehta',
    place: 'Jaipur',
    avatar: img.review1,
  },
  {
    text: 'Bought the Retro for my father in the village — 70+ km range on a single charge is unreal. Build quality feels solid and the carrier is very handy.',
    name: 'Anita Sharma',
    place: 'Kanpur',
    avatar: img.review2,
  },
  {
    text: 'Use the CargoX for my delivery business. Powerful 350W motor, handles load easily and running cost is almost nothing. Support team is very responsive.',
    name: 'Imran Qureshi',
    place: 'Delhi',
    avatar: img.review3,
  },
]

export default function Home() {
  return (
    <>
      <Hero />

      {/* Trust strip */}
      <section className="trust">
        <div className="container trust__row">
          <div className="trust__item">
            <Truck size={20} /> Free delivery across India
          </div>
          <div className="trust__item">
            <BatteryCharging size={20} /> Removable Li-ion battery
          </div>
          <div className="trust__item">
            <ShieldCheck size={20} /> 1-year motor &amp; battery warranty
          </div>
          <div className="trust__item">
            <Leaf size={20} /> 100% zero-emission
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">
              <Star size={13} /> The lineup
            </span>
            <h2>Meet the range</h2>
            <p>
              From colourful city cruisers to heavy-duty delivery haulers — every SS Bikes model runs
              on a silent 250W+ BLDC motor with dual disc brakes.
            </p>
          </div>
          <div className="grid grid--products">
            {featured().map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 34 }}>
            <Link to="/shop/e-bikes" className="btn btn--dark">
              View all e-bikes <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Split feature */}
      <section className="section section--tight">
        <div className="container">
          <div className="split">
            <div className="split__media">
              <img src={img.lifestyle} alt="Riding an SS Bikes e-cycle" />
            </div>
            <div className="split__body">
              <span className="eyebrow eyebrow--light">Engineered for India</span>
              <h2>Built to go the distance</h2>
              <p>
                Our e-cycles are equipped with efficient BLDC motors and long-lasting lithium
                batteries — delivering 90–100 km on pedal-assist or 75 km on pure throttle drive.
              </p>
              <ul className="split__list">
                <li>
                  <CheckCircle2 size={18} /> Three drive modes — pedal, assist &amp; throttle
                </li>
                <li>
                  <CheckCircle2 size={18} /> Removable battery, charges in 4–6 hours
                </li>
                <li>
                  <CheckCircle2 size={18} /> Dual disc brakes on every model
                </li>
                <li>
                  <CheckCircle2 size={18} /> No licence, no petrol, no registration
                </li>
              </ul>
              <div>
                <Link to="/about" className="btn btn--lime">
                  Our technology <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">
              <Leaf size={13} /> Why SS Bikes
            </span>
            <h2>Made with intention</h2>
          </div>
          <div className="values">
            <div className="value">
              <div className="value__ico">
                <IndianRupee size={22} />
              </div>
              <h3>Honest pricing</h3>
              <p>
                We obsess over the details and strive to deliver the best products at the best
                prices, every time — starting at just ₹23,000.
              </p>
            </div>
            <div className="value">
              <div className="value__ico">
                <Leaf size={22} />
              </div>
              <h3>Clean by design</h3>
              <p>
                We create with intention. Our zero-emission e-cycles solve real problems with clean
                design and honest materials.
              </p>
            </div>
            <div className="value">
              <div className="value__ico">
                <Wrench size={22} />
              </div>
              <h3>Always on your side</h3>
              <p>
                Keeping our loyal customers happy is our top priority — with genuine spares,
                servicing and a nationwide dealer network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section reviews">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">
              <Star size={13} /> Loved across India
            </span>
            <h2>What riders say</h2>
          </div>
          <div className="reviews__grid">
            {REVIEWS.map((r) => (
              <div className="review" key={r.name}>
                <div className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="#f5a623" />
                  ))}
                </div>
                <p>“{r.text}”</p>
                <div className="review__who">
                  <img className="review__ava" src={r.avatar} alt="" />
                  <div>
                    <b>{r.name}</b>
                    <span>{r.place}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="section section--tight">
        <div className="container">
          <div className="cta-band">
            <div>
              <span className="eyebrow eyebrow--light">Be electrified</span>
              <h2>Ready to make the switch?</h2>
              <p>Book a free test drive or become an SS Bikes dealer in your city.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/test-drive" className="btn btn--lime">
                Book test drive
              </Link>
              <Link to="/dealer-network" className="btn btn--ghost-light">
                Become a dealer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
