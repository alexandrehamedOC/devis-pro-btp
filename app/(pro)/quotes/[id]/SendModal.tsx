'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import styles from './SendModal.module.css'

interface SendModalProps {
  quote: {
    id: string; number: string; title: string
    client: { name: string; email: string | null }
  }
  onClose: () => void
  onSent: (updatedQuote: any) => void
}

export function SendModal({ quote, onClose, onSent }: SendModalProps) {
  const [email, setEmail] = useState(quote.client.email ?? '')
  const [subject, setSubject] = useState(`Votre devis pour ${quote.title} — n°${quote.number}`)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!email) { setError('Email requis'); return }
    setLoading(true); setError('')
    const res = await fetch(`/api/quotes/${quote.id}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, subject, message }),
    })
    if (res.ok) {
      const updated = await res.json()
      setSent(true)
      onSent(updated)
    } else {
      setError('Erreur lors de l\'envoi. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        {sent ? (
          <div className={styles.success}>
            <p className={styles.successIcon}>✉️</p>
            <h2 className={styles.successTitle}>Devis envoyé !</h2>
            <p className={styles.successText}>
              Votre devis a été envoyé à <strong>{quote.client.name}</strong>.<br />
              Vous serez notifié dès qu'il le consultera.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
              <Button onClick={onClose}>Retour aux devis</Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Envoyer le devis</h2>
              <button className={styles.close} onClick={onClose} aria-label="Fermer">×</button>
            </div>

            <div className={styles.body}>
              <div className={styles.field}>
                <label className={styles.label}>Destinataire *</label>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@client.com"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Objet de l'email</label>
                <input className={styles.input} value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Message personnalisé (optionnel)</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Bonjour, veuillez trouver ci-joint votre devis..."
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </div>

            <div className={styles.footer}>
              <Button variant="ghost" onClick={onClose}>Annuler</Button>
              <Button loading={loading} onClick={handleSend}>Confirmer l'envoi</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
