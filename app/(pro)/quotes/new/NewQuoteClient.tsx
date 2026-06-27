'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Client { id: string; name: string; email: string | null }

export function NewQuoteClient() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const selected = clients.find(c => c.id === selectedClientId)

  const handleCreate = async () => {
    if (!selectedClientId) return
    setLoading(true)
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: selectedClientId, title }),
    })
    if (res.ok) {
      const quote = await res.json()
      router.push(`/quotes/${quote.id}`)
    } else {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: 8 }}>
        <Link href="/dashboard">← Tableau de bord</Link>
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 32 }}>
        Nouveau devis
      </h1>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 6 }}>
              Client *
            </label>
            {selected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1.5px solid var(--accent)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-light)' }}>
                <span style={{ fontWeight: 500 }}>{selected.name}</span>
                <button onClick={() => { setSelectedClientId(''); setSearch('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', minHeight: 44, padding: '0 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', backgroundColor: 'var(--surface-card)' }}
                />
                {search && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 10, marginTop: 4 }}>
                    {filtered.length === 0 ? (
                      <p style={{ padding: '12px 16px', color: 'var(--ink-muted)', fontSize: '0.9375rem' }}>
                        Aucun client trouvé. <Link href="/clients/new">Créer un client</Link>
                      </p>
                    ) : (
                      <ul style={{ listStyle: 'none', maxHeight: 200, overflow: 'auto' }}>
                        {filtered.map(c => (
                          <li key={c.id}>
                            <button onClick={() => { setSelectedClientId(c.id); setSearch('') }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9375rem' }}>
                              {c.name} {c.email && <span style={{ color: 'var(--ink-muted)', fontSize: '0.8125rem' }}>— {c.email}</span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
            <p style={{ marginTop: 6, fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>
              Pas encore dans la liste ? <Link href="/clients/new">Créer une fiche client</Link>
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 6 }}>
              Objet du devis
            </label>
            <input
              type="text"
              placeholder="Ex: Rénovation salle de bains"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', minHeight: 44, padding: '0 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', backgroundColor: 'var(--surface-card)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => router.back()}>Annuler</Button>
            <Button onClick={handleCreate} loading={loading} disabled={!selectedClientId}>
              Créer le devis
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
