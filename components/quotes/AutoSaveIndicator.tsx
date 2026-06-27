'use client'

import { Spinner } from '@/components/ui/Spinner'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function AutoSaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null

  const config = {
    saving: { color: 'var(--ink-muted)', text: 'Enregistrement...' },
    saved: { color: 'var(--success)', text: 'Enregistré' },
    error: { color: 'var(--error)', text: 'Erreur d\'enregistrement — vérifiez votre connexion' },
  }[state]

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: config.color, transition: 'opacity 200ms' }}>
      {state === 'saving' && <Spinner size={10} color={config.color} />}
      {state === 'saved' && <span aria-hidden>✓</span>}
      {config.text}
    </span>
  )
}
