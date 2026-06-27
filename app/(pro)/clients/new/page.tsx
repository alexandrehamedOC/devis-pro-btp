import { ClientForm } from '../ClientForm'

export const metadata = { title: 'Nouveau client — Devis Pro BTP' }

export default function NewClientPage() {
  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 32 }}>
        Nouveau client
      </h1>
      <ClientForm />
    </div>
  )
}
