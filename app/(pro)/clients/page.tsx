import Link from 'next/link'
import { ClientsList } from './ClientsList'

export const metadata = { title: 'Clients — Devis Pro BTP' }

export default function ClientsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Clients</h1>
        <Link
          href="/clients/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            minHeight: 44, padding: '0 20px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent)', color: '#fff',
            fontWeight: 500, fontSize: '0.9375rem', textDecoration: 'none',
          }}
        >
          + Nouveau client
        </Link>
      </div>
      <ClientsList />
    </div>
  )
}
