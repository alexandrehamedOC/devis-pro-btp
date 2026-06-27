'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClientForm } from '../ClientForm'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { computeTotals } from '@/lib/totals'
import type { QuoteStatusVariant } from '@/components/ui/Badge'

interface Quote {
  id: string; number: string; title: string; status: QuoteStatusVariant
  createdAt: string; lines: Array<{ quantity: string; unitPriceHt: string; tvaRate: string }>
}

interface Client {
  id: string; name: string; email: string | null; phone: string | null
  address: string | null; notes: string | null; quotes: Quote[]
}

export function ClientDetail({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise)
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(setClient)
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Archiver ce client ? Les devis existants restent accessibles.')) return
    setDeleting(true)
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.push('/clients')
  }

  if (!client) return <p style={{ color: 'var(--ink-muted)' }}>Chargement...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: 4 }}>
            <Link href="/clients">← Clients</Link>
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>{client.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => setEditing(!editing)}>
            {editing ? 'Annuler' : 'Modifier'}
          </Button>
          <Button variant="ghost" loading={deleting} onClick={handleDelete}>Archiver</Button>
        </div>
      </div>

      {editing ? (
        <ClientForm
          clientId={id}
          defaultValues={{ name: client.name, email: client.email ?? '', phone: client.phone ?? '', address: client.address ?? '', notes: client.notes ?? '' }}
          onSuccess={() => { setEditing(false); fetch(`/api/clients/${id}`).then(r => r.json()).then(setClient) }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card>
            <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px 0' }}>
              {client.email && <><dt style={{ color: 'var(--ink-muted)', fontSize: '0.875rem' }}>Email</dt><dd>{client.email}</dd></>}
              {client.phone && <><dt style={{ color: 'var(--ink-muted)', fontSize: '0.875rem' }}>Téléphone</dt><dd>{client.phone}</dd></>}
              {client.address && <><dt style={{ color: 'var(--ink-muted)', fontSize: '0.875rem' }}>Adresse</dt><dd>{client.address}</dd></>}
              {client.notes && <><dt style={{ color: 'var(--ink-muted)', fontSize: '0.875rem' }}>Notes</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{client.notes}</dd></>}
            </dl>
          </Card>

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 16 }}>
              Devis ({client.quotes.length})
            </h2>
            {client.quotes.length === 0 ? (
              <Card><p style={{ color: 'var(--ink-muted)' }}>Aucun devis pour ce client.</p></Card>
            ) : (
              <Card padding="none">
                <ul style={{ listStyle: 'none' }}>
                  {client.quotes.map(q => {
                    const totals = computeTotals(q.lines)
                    return (
                      <li key={q.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <Link href={`/quotes/${q.id}`} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 24px', textDecoration: 'none', gap: 16,
                        }}>
                          <div>
                            <p style={{ fontWeight: 500, color: 'var(--ink)', margin: '0 0 2px' }}>{q.number} — {q.title}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', margin: 0 }}>
                              {new Date(q.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem' }}>
                              {totals.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                            <Badge status={q.status} />
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
