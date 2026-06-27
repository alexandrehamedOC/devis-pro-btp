'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { computeTotals } from '@/lib/totals'
import type { QuoteStatusVariant } from '@/components/ui/Badge'
import styles from './Dashboard.module.css'

interface Quote {
  id: string; number: string; title: string; status: QuoteStatusVariant; updatedAt: string
  client: { name: string }
  lines: Array<{ quantity: string; unitPriceHt: string; tvaRate: string }>
}

const STATUS_FILTERS: Array<{ value: QuoteStatusVariant | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tous' },
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'SENT', label: 'Envoyé' },
  { value: 'VIEWED', label: 'Consulté' },
  { value: 'ACCEPTED', label: 'Accepté' },
  { value: 'REFUSED', label: 'Refusé' },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l'instant'
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'hier'
  if (d < 30) return `il y a ${d} j`
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.sk1} /><div className={styles.sk2} /><div className={styles.sk3} />
    </div>
  )
}

export function DashboardClient() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null)
  const [filter, setFilter] = useState<QuoteStatusVariant | 'ALL'>('ALL')

  useEffect(() => {
    fetch('/api/quotes').then(r => r.json()).then(setQuotes)
  }, [])

  const filtered = filter === 'ALL' ? quotes : quotes?.filter(q => q.status === filter)

  // Stats
  const pending = quotes?.filter(q => ['SENT', 'VIEWED'].includes(q.status)).length ?? 0
  const thisMonth = quotes?.filter(q => {
    const d = new Date(q.updatedAt); const n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  }).reduce((s, q) => s + computeTotals(q.lines).totalTtc, 0) ?? 0
  const lastSent = quotes?.find(q => q.status !== 'DRAFT')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Tableau de bord</h1>
        <Link href="/quotes/new" className={styles.newBtn}>+ Nouveau devis</Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <Card><p className={styles.statLabel}>En attente</p><p className={styles.statValue}>{quotes === null ? '—' : pending}</p></Card>
        <Card>
          <p className={styles.statLabel}>Ce mois</p>
          <p className={styles.statValue} style={{ fontFamily: 'var(--font-mono)' }}>
            {quotes === null ? '—' : thisMonth.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </Card>
        <Card>
          <p className={styles.statLabel}>Dernier envoyé</p>
          <p className={styles.statValue}>{lastSent ? timeAgo(lastSent.updatedAt) : '—'}</p>
        </Card>
      </div>

      {/* Filtres */}
      <div className={styles.filters}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            className={[styles.filterChip, filter === f.value ? styles.filterActive : ''].join(' ')}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {quotes === null ? (
        <Card padding="none">
          <div style={{ padding: '8px 0' }}>
            <SkeletonRow /><SkeletonRow /><SkeletonRow />
          </div>
        </Card>
      ) : quotes.length === 0 ? (
        <Card>
          <div className={styles.empty}>
            <p>Aucun devis pour l'instant</p>
            <Link href="/quotes/new" className={styles.emptyBtn}>+ Nouveau devis</Link>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th>Activité</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map(q => {
                const totals = computeTotals(q.lines)
                return (
                  <tr key={q.id} onClick={() => { window.location.href = `/quotes/${q.id}` }} className={styles.tableRow}>
                    <td className={styles.number}>{q.number}</td>
                    <td>{q.client.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {totals.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td><Badge status={q.status} /></td>
                    <td className={styles.timeago}>{timeAgo(q.updatedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
