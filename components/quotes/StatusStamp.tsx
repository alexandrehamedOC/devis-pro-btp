import type { QuoteStatusVariant } from '@/components/ui/Badge'
import styles from './StatusStamp.module.css'

const STAMP_CONFIG: Partial<Record<QuoteStatusVariant, { label: string; color: string }>> = {
  SENT: { label: 'ENVOYÉ', color: 'var(--warning)' },
  VIEWED: { label: 'CONSULTÉ', color: 'var(--warning)' },
  ACCEPTED: { label: 'ACCEPTÉ', color: 'var(--success)' },
  REFUSED: { label: 'REFUSÉ', color: 'var(--error)' },
}

interface StatusStampProps {
  status: QuoteStatusVariant
  animate?: boolean
}

export function StatusStamp({ status, animate = false }: StatusStampProps) {
  const cfg = STAMP_CONFIG[status]
  if (!cfg) return null

  return (
    <div
      className={[styles.stamp, animate ? styles.animate : ''].filter(Boolean).join(' ')}
      style={{ '--stamp-color': cfg.color } as React.CSSProperties}
    >
      {cfg.label}
    </div>
  )
}
