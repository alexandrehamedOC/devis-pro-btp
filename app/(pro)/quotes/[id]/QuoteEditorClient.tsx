'use client'

import { use, useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { QuoteLinesTable, type QuoteLine } from '@/components/quotes/QuoteLinesTable'
import { QuoteSummary } from '@/components/quotes/QuoteSummary'
import { AutoSaveIndicator, type SaveState } from '@/components/quotes/AutoSaveIndicator'
import { StatusStamp } from '@/components/quotes/StatusStamp'
import { SendModal } from './SendModal'
import type { QuoteStatusVariant } from '@/components/ui/Badge'
import styles from './QuoteEditor.module.css'

interface QuoteData {
  id: string; number: string; title: string; status: QuoteStatusVariant
  introNote: string | null; paymentConditions: string | null; legalText: string | null
  validUntil: string | null; token: string
  client: { id: string; name: string; email: string | null; phone: string | null; address: string | null }
  lines: QuoteLine[]
}

export function QuoteEditorClient({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise)
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [lines, setLines] = useState<QuoteLine[]>([])
  const [title, setTitle] = useState('')
  const [introNote, setIntroNote] = useState('')
  const [paymentConditions, setPaymentConditions] = useState('')
  const [legalText, setLegalText] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [showSendModal, setShowSendModal] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSaved = useRef<string>('')

  useEffect(() => {
    fetch(`/api/quotes/${id}`).then(r => r.json()).then((q: QuoteData) => {
      setQuote(q)
      setLines(q.lines)
      setTitle(q.title)
      setIntroNote(q.introNote ?? '')
      setPaymentConditions(q.paymentConditions ?? '')
      setLegalText(q.legalText ?? '')
      setValidUntil(q.validUntil ? q.validUntil.split('T')[0] : '')
    })
  }, [id])

  const buildPayload = useCallback(() => ({
    title, introNote, paymentConditions, legalText,
    validUntil: validUntil || undefined,
    lines: lines.map((l, i) => ({ ...l, position: i })),
  }), [title, introNote, paymentConditions, legalText, validUntil, lines])

  const save = useCallback(async () => {
    const payload = JSON.stringify(buildPayload())
    if (payload === lastSaved.current) return
    setSaveState('saving')
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      })
      if (res.ok) { setSaveState('saved'); lastSaved.current = payload }
      else setSaveState('error')
    } catch { setSaveState('error') }
  }, [buildPayload, id])

  // Auto-save toutes les 30s
  useEffect(() => {
    if (!quote || quote.status !== 'DRAFT') return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(save, 30000)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [lines, title, introNote, paymentConditions, legalText, validUntil, save, quote])

  const isDraft = quote?.status === 'DRAFT'

  if (!quote) return <p style={{ color: 'var(--ink-muted)' }}>Chargement...</p>

  return (
    <div>
      {/* En-tête */}
      <div className={styles.header}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: 4 }}>
            <Link href="/dashboard">← Tableau de bord</Link>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0 }}>
              Devis {quote.number}
            </h1>
            <Badge status={quote.status} />
            {!isDraft && <StatusStamp status={quote.status} />}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <AutoSaveIndicator state={saveState} />
          {isDraft && <Button variant="secondary" onClick={save}>Sauvegarder</Button>}
          <Link href={`/quotes/${id}/preview`} className={styles.previewLink}>Prévisualiser PDF</Link>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Formulaire */}
        <div className={styles.form}>
          <Card>
            <h2 className={styles.sectionTitle}>Informations générales</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className={styles.label}>Objet du devis</label>
                <input
                  className={styles.input}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  readOnly={!isDraft}
                  placeholder="Ex: Rénovation salle de bains"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className={styles.label}>Client</label>
                  <p style={{ margin: 0 }}><Link href={`/clients/${quote.client.id}`}>{quote.client.name}</Link></p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
                    {quote.client.address}
                  </p>
                </div>
                <div>
                  <label className={styles.label}>Valable jusqu'au</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={validUntil}
                    onChange={e => setValidUntil(e.target.value)}
                    readOnly={!isDraft}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className={styles.sectionTitle}>Prestations</h2>
            <QuoteLinesTable lines={lines} onChange={setLines} readOnly={!isDraft} />
          </Card>

          <Card>
            <h2 className={styles.sectionTitle}>Note d'introduction</h2>
            <textarea
              className={styles.textarea}
              rows={3}
              value={introNote}
              onChange={e => setIntroNote(e.target.value)}
              readOnly={!isDraft}
              placeholder="Message personnalisé qui apparaîtra en haut du devis..."
            />
          </Card>

          <Card>
            <h2 className={styles.sectionTitle}>Conditions de paiement</h2>
            <textarea
              className={styles.textarea}
              rows={3}
              value={paymentConditions}
              onChange={e => setPaymentConditions(e.target.value)}
              readOnly={!isDraft}
            />
          </Card>

          <Card>
            <h2 className={styles.sectionTitle}>Mentions légales</h2>
            <textarea
              className={styles.textarea}
              rows={3}
              value={legalText}
              onChange={e => setLegalText(e.target.value)}
              readOnly={!isDraft}
            />
          </Card>
        </div>

        {/* Récapitulatif sticky */}
        <QuoteSummary
          lines={lines}
          status={quote.status}
          onPreview={() => window.open(`/quotes/${id}/preview`, '_blank')}
          onSend={() => setShowSendModal(true)}
          sendDisabled={lines.length === 0}
        />
      </div>

      {showSendModal && (
        <SendModal
          quote={quote}
          onClose={() => setShowSendModal(false)}
          onSent={(updatedQuote) => {
            setQuote(updatedQuote)
            setShowSendModal(false)
          }}
        />
      )}
    </div>
  )
}
