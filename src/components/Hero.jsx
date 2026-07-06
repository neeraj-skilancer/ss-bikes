import { Link, useSearchParams } from 'react-router-dom'
import { Zap, Star, BatteryCharging, ArrowRight } from 'lucide-react'
import { img } from '../data/products'

const BIKE = img.cosmosStandard

function Stars({ size = 13 }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill="#f5a623" />
      ))}
    </div>
  )
}

const Sub = () => (
  <p className="hero__sub">
    India's revolutionary range of e-cycles — zero-emission, up to 100 km on a single charge, with
    pedal-assist and throttle drive. Simple, intuitive mobility for everyday commuting.
  </p>
)

const Ctas = ({ light, dark }) => (
  <div className="hero__cta">
    <Link to="/shop/e-bikes" className={dark ? 'btn btn--dark' : 'btn btn--lime'}>
      Shop all e-bikes <ArrowRight size={16} />
    </Link>
    <Link to="/test-drive" className={light ? 'btn btn--ghost-light' : 'btn btn--ghost'}>
      Book a test drive
    </Link>
  </div>
)

const Stats = () => (
  <div className="hero__stats">
    <div className="hero__stat">
      <b>100 km</b>
      <span>Range per charge</span>
    </div>
    <div className="hero__stat">
      <b>₹23,000</b>
      <span>Starting price</span>
    </div>
    <div className="hero__stat">
      <b>0 g</b>
      <span>CO₂ emissions</span>
    </div>
  </div>
)

/* ---------- Variant 1: Showcase (green split + floating cards) ---------- */
function Showcase() {
  return (
    <section className="hero">
      <div className="hero__glow" />
      <div className="container hero__grid">
        <div className="hero__content">
          <span className="eyebrow eyebrow--light">
            <Zap size={14} /> The e-cycle revolution
          </span>
          <h1>
            Ride electric. <span>Ride free.</span>
          </h1>
          <Sub />
          <Ctas light />
          <Stats />
        </div>
        <div className="hero__showcase">
          <div className="hero__tag">
            <Zap size={13} /> New 2026 range
          </div>
          <div className="hero__photo">
            <img src={BIKE} alt="SS Bikes Cosmos electric cycle" />
          </div>
          <div className="hero__float hero__float--rating">
            <Stars />
            <div>
              <b>4.8 / 5</b>
              <span>2,000+ happy riders</span>
            </div>
          </div>
          <div className="hero__float hero__float--spec">
            <span className="hero__float-ico">
              <BatteryCharging size={18} />
            </span>
            <div>
              <b>250W · 100 km</b>
              <span>BLDC motor · per charge</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Variant 2: Full-bleed cinematic banner ---------- */
function Banner() {
  return (
    <section className="hero2">
      <img className="hero2__img" src={BIKE} alt="SS Bikes electric cycle" />
      <div className="hero2__scrim" />
      <div className="container">
        <div className="hero2__content">
          <span className="hero2__record">
            <Star size={13} fill="#f5a623" strokeWidth={0} /> Trusted by 2,000+ riders across India
          </span>
          <span className="eyebrow eyebrow--light">
            <Zap size={14} /> The e-cycle revolution
          </span>
          <h1>
            Ride electric. <span>Ride free.</span>
          </h1>
          <Sub />
          <Ctas light />
          <Stats />
        </div>
      </div>
    </section>
  )
}

/* ---------- Variant 3: Minimal centered (light) ---------- */
function Minimal() {
  return (
    <section className="hero3">
      <div className="container">
        <div className="hero3__content">
          <span className="eyebrow">
            <Zap size={14} /> The e-cycle revolution
          </span>
          <h1>
            Ride electric. <span>Ride free.</span>
          </h1>
          <Sub />
          <Ctas />
          <div className="hero3__meta">
            <Stars size={15} />
            <span>Loved by 2,000+ riders across India</span>
          </div>
        </div>
        <div className="hero3__photo">
          <img src={BIKE} alt="SS Bikes electric cycle" />
          <div className="hero__tag">
            <Zap size={13} /> New 2026 range
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Variant 4: Editorial colour block ---------- */
function Editorial() {
  return (
    <section className="hero4">
      <div className="hero4__block">
        <span className="eyebrow" style={{ color: 'var(--dark)' }}>
          <Zap size={14} /> The e-cycle revolution
        </span>
        <h1>
          Ride electric.
          <br />
          <span>Ride free.</span>
        </h1>
        <Sub />
        <Ctas dark />
        <Stats />
      </div>
      <div className="hero4__media">
        <img src={BIKE} alt="SS Bikes electric cycle" />
      </div>
    </section>
  )
}

const VARIANTS = { 1: Showcase, 2: Banner, 3: Minimal, 4: Editorial }

export default function Hero() {
  const [params] = useSearchParams()
  const Comp = VARIANTS[params.get('hero')] || Banner
  return <Comp />
}
