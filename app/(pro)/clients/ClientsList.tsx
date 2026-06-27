'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import styles from './ClientsList.module.css'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  _count: { quotes: number }
  updatedAt: string
}

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.skeletonName} />
      <div className={styles.skeletonMeta} />
    </div>
  )
}

export function ClientsList() {
  const [clients, setClients] = useState<Client[] | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  const filtered = clients?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (clients === null) {
    return (
      <Card>
        <div className={styles.skeletonList}>
          <SkeletonRow /><SkeletonRow /><SkeletonRow />
        </div>
      </Card>
    )
  }

  return (
    <div>
      {clients.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {clients.length === 0 ? (
        <Card>
          <div className={styles.empty}>
            <p>Aucun client encore</p>
            <p className={styles.emptyHint}>Créez votre première fiche client pour commencer</p>
            <Link href="/clients/new" className={styles.emptyBtn}>Nouveau client</Link>
          </div>
        </Card>
      ) : filtered?.length === 0 ? (
        <Card><p style={{ color: 'var(--ink-muted)', padding: '8px 0' }}>Aucun client ne correspond à votre recherche.</p></Card>
      ) : (
        <Card padding="none">
          <ul className={styles.list} role="list">
            {filtered?.map(client => (
              <li key={client.id}>
                <Link href={`/clients/${client.id}`} className={styles.row}>
                  <div>
                    <p className={styles.name}>{client.name}</p>
                    <p className={styles.meta}>
                      {[client.email, client.phone].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className={styles.count}>
                    {client._count.quotes} devis
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
