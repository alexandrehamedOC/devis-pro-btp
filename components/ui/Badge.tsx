import styles from './Badge.module.css'

export type QuoteStatusVariant = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REFUSED'

const LABELS: Record<QuoteStatusVariant, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  VIEWED: 'Consulté',
  ACCEPTED: 'Accepté',
  REFUSED: 'Refusé',
}

interface BadgeProps {
  status: QuoteStatusVariant
  className?: string
}

export function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[status.toLowerCase()], className].filter(Boolean).join(' ')}>
      {status === 'VIEWED' && <span className={styles.dot} aria-hidden="true" />}
      {LABELS[status]}
    </span>
  )
}
