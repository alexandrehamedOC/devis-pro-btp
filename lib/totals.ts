export interface QuoteLineInput {
  quantity: number | string
  unitPriceHt: number | string
  tvaRate: number | string
}

export interface QuoteTotals {
  totalHt: number
  byTva: Record<number, number>
  totalTva: number
  totalTtc: number
}

export function computeTotals(lines: QuoteLineInput[]): QuoteTotals {
  const byTva: Record<number, number> = {}
  let totalHt = 0

  for (const line of lines) {
    const qty = Number(line.quantity)
    const price = Number(line.unitPriceHt)
    const tva = Number(line.tvaRate)

    if (isNaN(qty) || isNaN(price) || isNaN(tva)) continue

    const lineHt = round2(qty * price)
    totalHt += lineHt
    byTva[tva] = round2((byTva[tva] ?? 0) + lineHt * (tva / 100))
  }

  totalHt = round2(totalHt)
  const totalTva = round2(Object.values(byTva).reduce((a, b) => a + b, 0))

  return {
    totalHt,
    byTva,
    totalTva,
    totalTtc: round2(totalHt + totalTva),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
