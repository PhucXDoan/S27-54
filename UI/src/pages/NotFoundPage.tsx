import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="panel empty-state">
        <SearchX aria-hidden="true" size={30} />
        <h1>Patient not found</h1>
        <p>This foal is not part of the current simulated monitoring session.</p>
        <Link className="button button--primary" to="/">
          Return to patient board
        </Link>
      </section>
    </main>
  )
}
