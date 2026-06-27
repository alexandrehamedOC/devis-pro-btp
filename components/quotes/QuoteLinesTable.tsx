'use client'

import { useRef } from 'react'
import styles from './QuoteLinesTable.module.css'

export interface QuoteLine {
  id?: string
  position: number
  description: string
  quantity: number
  unit: string
  unitPriceHt: number
  tvaRate: number
}

const UNITS = ['m²', 'ml', 'h', 'u', 'forfait', 'j', 'm³', 'T']
const TVA_RATES = [0, 5.5, 10, 20]

interface QuoteLinesTableProps {
  lines: QuoteLine[]
  onChange: (lines: QuoteLine[]) => void
  readOnly?: boolean
}

export function QuoteLinesTable({ lines, onChange, readOnly = false }: QuoteLinesTableProps) {
  const dragIdx = useRef<number | null>(null)

  const update = (index: number, field: keyof QuoteLine, value: string | number) => {
    const next = lines.map((l, i) => i === index ? { ...l, [field]: value } : l)
    onChange(next)
  }

  const addLine = () => {
    onChange([...lines, { position: lines.length, description: '', quantity: 1, unit: 'forfait', unitPriceHt: 0, tvaRate: 10 }])
  }

  const removeLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index).map((l, i) => ({ ...l, position: i })))
  }

  const onDragStart = (i: number) => { dragIdx.current = i }
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === i) return
    const next = [...lines]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(i, 0, moved)
    dragIdx.current = i
    onChange(next.map((l, idx) => ({ ...l, position: idx })))
  }

  return (
    <div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {!readOnly && <th style={{ width: 28 }} />}
              <th>Description</th>
              <th style={{ width: 80 }}>Qté</th>
              <th style={{ width: 90 }}>Unité</th>
              <th style={{ width: 110 }}>PU HT</th>
              <th style={{ width: 80 }}>TVA</th>
              <th style={{ width: 110 }}>Total HT</th>
              {!readOnly && <th style={{ width: 40 }} />}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => {
              const lineTotal = Math.round(Number(line.quantity) * Number(line.unitPriceHt) * 100) / 100
              return (
                <tr
                  key={i}
                  className={styles.row}
                  draggable={!readOnly}
                  onDragStart={() => onDragStart(i)}
                  onDragOver={e => onDragOver(e, i)}
                >
                  {!readOnly && (
                    <td className={styles.grip} aria-label="Réordonner">⠿</td>
                  )}
                  <td>
                    {readOnly ? (
                      <span>{line.description}</span>
                    ) : (
                      <input
                        className={styles.cell}
                        value={line.description}
                        onChange={e => update(i, 'description', e.target.value)}
                        placeholder="Description de la prestation"
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span>{line.quantity}</span>
                    ) : (
                      <input
                        className={[styles.cell, styles.number].join(' ')}
                        type="number" min="0" step="0.01"
                        value={line.quantity}
                        onChange={e => update(i, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span>{line.unit}</span>
                    ) : (
                      <select
                        className={styles.cell}
                        value={line.unit}
                        onChange={e => update(i, 'unit', e.target.value)}
                      >
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{Number(line.unitPriceHt).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
                    ) : (
                      <input
                        className={[styles.cell, styles.number].join(' ')}
                        type="number" min="0" step="0.01"
                        value={line.unitPriceHt}
                        onChange={e => update(i, 'unitPriceHt', parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span>{line.tvaRate}%</span>
                    ) : (
                      <select
                        className={styles.cell}
                        value={line.tvaRate}
                        onChange={e => update(i, 'tvaRate', parseFloat(e.target.value))}
                      >
                        {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    )}
                  </td>
                  <td className={styles.lineTotal}>
                    {lineTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  {!readOnly && (
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => removeLine(i)}
                        aria-label={`Supprimer ligne ${i + 1}`}
                        title="Supprimer"
                      >
                        🗑
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button className={styles.addBtn} onClick={addLine}>
          + Ajouter une ligne
        </button>
      )}
    </div>
  )
}
