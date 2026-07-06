import { Link } from 'react-router-dom'
import { Leaf, Zap, Gauge, Users } from 'lucide-react'
import { img } from '../data/products'

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <h1>About SS Bikes</h1>
          <p>
            The revolutionary range of e-cycles transforming short-distance commuting in India —
            sustainably, affordably and beautifully.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container prose">
          <p>
            At SS Bikes we manufacture zero-emission vehicles powered by sustainable energy and
            long-lasting batteries. Our e-cycles are equipped with efficient BLDC motors offering a
            range of <strong>90–100 km on a single charge</strong> with pedal-assist, or{' '}
            <strong>75 km on pure throttle drive</strong> — all with three intuitive drive modes.
          </p>
          <p>
            We're on a mission to upgrade mobility and short-distance commute in India. We create
            with intention: products that suit your need and match your style, while advancing
            environmental sustainability and helping eliminate global warming.
          </p>

          <h2>What we stand for</h2>
          <p>
            Our objective is simple — transforming lives by bringing technology to people that is
            simple and intuitive. Be electrified, the revolution has just begun.
          </p>
        </div>

        <div className="container" style={{ marginTop: 36 }}>
          <div className="stat-row">
            <div className="stat-card">
              <b>100 km</b>
              <span>Range on a single charge</span>
            </div>
            <div className="stat-card">
              <b>0</b>
              <span>Grams of CO₂ emitted</span>
            </div>
            <div className="stat-card">
              <b>3</b>
              <span>Drive modes on every bike</span>
            </div>
            <div className="stat-card">
              <b>₹0.10</b>
              <span>Approx. running cost per km</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="split">
            <div className="split__media">
              <img src={img.lifestyle} alt="SS Bikes rider" />
            </div>
            <div className="split__body">
              <span className="eyebrow eyebrow--light">The mission</span>
              <h2>Be electrified</h2>
              <p>
                Every SS Bikes e-cycle is a step towards cleaner air, quieter streets and freedom
                from rising fuel costs. We build for the everyday rider — students, commuters,
                families and delivery riders alike.
              </p>
              <ul className="split__list">
                <li>
                  <Leaf size={18} /> Sustainable, zero-emission mobility
                </li>
                <li>
                  <Zap size={18} /> Efficient BLDC motors &amp; lithium batteries
                </li>
                <li>
                  <Gauge size={18} /> Long range with pedal-assist &amp; throttle
                </li>
                <li>
                  <Users size={18} /> Built for every kind of rider
                </li>
              </ul>
              <div>
                <Link to="/shop/e-bikes" className="btn btn--lime">
                  Explore the range
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
