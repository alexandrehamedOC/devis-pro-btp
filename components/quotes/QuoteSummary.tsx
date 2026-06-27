import { computeTotals, type QuoteLineInput } from '@/lib/totals'
import styles from './QuoteSummary.module.css'

interface QuoteSummaryProps {
  lines: QuoteLineInput[]
  onPreview?: () => void
  onSend?: () => void
  sendDisabled?: boolean
  status?: string
}

export function QuoteSummary({ lines, onPreview, onSend, sendDisabled, status }: QuoteSummaryProps) {
  const totals = computeTotals(lines)
  const isDraft = !status || status === 'DRAFT'

  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>Récapitulatif</h2>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span>Total HT</span>
          <span>{totals.totalHt.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
        </div>

        {Object.entries(totals.byTva).map(([rate, amount]) => (
          <div className={styles.row} key={rate} style={{ color: 'var(--ink-muted)', fontSize: '0.875rem' }}>
            <span>TVA {rate}%</span>
            <span>{amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        ))}

        <div className={styles.divider} />

        <div className={[styles.row, styles.total].join(' ')}>
          <span>Total TTC</span>
          <span className={styles.totalAmount}>
            {totals.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      {isDraft && (
        <div className={styles.actions}>
          {onPreview && (
            <button className={styles.previewBtn} onClick={onPreview}>
              Prévisualiser le PDF
            </button>
          )}
          {onSend && (
            <button className={styles.sendBtn} onClick={onSend} disabled={sendDisabled}>
              Envoyer le devis
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
