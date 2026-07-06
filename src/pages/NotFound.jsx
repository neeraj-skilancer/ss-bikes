import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container center-narrow">
        <h1 style={{ fontSize: '3rem' }}>404</h1>
        <p style={{ color: 'var(--muted)', margin: '10px 0 22px' }}>
          This page took a wrong turn. Let's get you back on the road.
        </p>
        <Link to="/" className="btn btn--primary">
          Back home
        </Link>
      </div>
    </section>
  )
}
