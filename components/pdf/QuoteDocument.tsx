import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { computeTotals } from '@/lib/totals'

const styles = StyleSheet.create({
  page: { fontFamily: 'Inter', fontSize: 10, padding: 40, color: '#1C1410', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  proName: { fontFamily: 'Fraunces', fontSize: 16, fontWeight: 700, color: '#1C1410', marginBottom: 4 },
  proMeta: { fontSize: 9, color: '#8B7355', lineHeight: 1.5 },
  quoteTitle: { fontFamily: 'Fraunces', fontSize: 20, fontWeight: 600, color: '#1C1410', marginBottom: 4 },
  quoteNumber: { fontSize: 9, color: '#8B7355' },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'Fraunces', fontSize: 11, fontWeight: 600, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#D4C5B0', paddingBottom: 4 },
  clientName: { fontWeight: 600, marginBottom: 2 },
  text: { lineHeight: 1.5 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F5F0E8', padding: '6 10', borderRadius: 4, marginBottom: 2 },
  tableRow: { flexDirection: 'row', padding: '6 10', borderBottomWidth: 1, borderBottomColor: '#EDE8DE' },
  col: { flex: 3 },
  colSm: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },
  colHeader: { fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: '#8B7355' },
  totalsBox: { alignItems: 'flex-end', marginTop: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 200, marginBottom: 4 },
  totalLabel: { color: '#8B7355' },
  totalTtc: { fontFamily: 'Fraunces', fontSize: 14, fontWeight: 700 },
  note: { backgroundColor: '#F5F0E8', padding: 12, borderRadius: 4, lineHeight: 1.6 },
  footer: { marginTop: 24, fontSize: 8, color: '#8B7355', lineHeight: 1.5 },
})

interface QuoteDocumentProps {
  quote: {
    number: string; title: string; createdAt: string; validUntil: string | null
    introNote: string | null; paymentConditions: string | null; legalText: string | null
    client: { name: string; email: string | null; phone: string | null; address: string | null }
    lines: Array<{ description: string; quantity: number | string; unit: string; unitPriceHt: number | string; tvaRate: number | string }>
  }
  user: {
    name: string; specialty: string | null; phone: string | null; email: string
    address?: string | null; siret: string | null; assurance: string | null
  }
}

export function QuoteDocument({ quote, user }: QuoteDocumentProps) {
  const totals = computeTotals(quote.lines)
  const fmt = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  const date = (d: string) => new Date(d).toLocaleDateString('fr-FR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.proName}>{user.name}</Text>
            {user.specialty && <Text style={styles.proMeta}>{user.specialty}</Text>}
            {user.phone && <Text style={styles.proMeta}>{user.phone}</Text>}
            <Text style={styles.proMeta}>{user.email}</Text>
            {user.siret && <Text style={styles.proMeta}>SIRET : {user.siret}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.quoteTitle}>Devis</Text>
            <Text style={styles.quoteNumber}>N° {quote.number}</Text>
            <Text style={styles.quoteNumber}>Date : {date(quote.createdAt)}</Text>
            {quote.validUntil && <Text style={styles.quoteNumber}>Valable jusqu'au : {date(quote.validUntil)}</Text>}
          </View>
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={styles.clientName}>{quote.client.name}</Text>
          {quote.client.address && <Text style={styles.text}>{quote.client.address}</Text>}
          {quote.client.email && <Text style={styles.text}>{quote.client.email}</Text>}
          {quote.client.phone && <Text style={styles.text}>{quote.client.phone}</Text>}
        </View>

        {/* Note intro */}
        {quote.introNote && (
          <View style={[styles.section, styles.note]}>
            <Text style={styles.text}>{quote.introNote}</Text>
          </View>
        )}

        {/* Lignes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{quote.title || 'Prestations'}</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.col, styles.colHeader]}>Description</Text>
            <Text style={[styles.colSm, styles.colHeader]}>Qté</Text>
            <Text style={[styles.colSm, styles.colHeader]}>Unité</Text>
            <Text style={[styles.colSm, styles.colHeader]}>PU HT</Text>
            <Text style={[styles.colSm, styles.colHeader]}>TVA</Text>
            <Text style={[styles.colTotal, styles.colHeader]}>Total HT</Text>
          </View>
          {quote.lines.map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col}>{l.description}</Text>
              <Text style={styles.colSm}>{Number(l.quantity)}</Text>
              <Text style={styles.colSm}>{l.unit}</Text>
              <Text style={styles.colSm}>{fmt(Number(l.unitPriceHt))}</Text>
              <Text style={styles.colSm}>{Number(l.tvaRate)}%</Text>
              <Text style={styles.colTotal}>{fmt(Number(l.quantity) * Number(l.unitPriceHt))}</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text>{fmt(totals.totalHt)}</Text>
          </View>
          {Object.entries(totals.byTva).map(([rate, amount]) => (
            <View key={rate} style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA {rate}%</Text>
              <Text>{fmt(amount)}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, { marginTop: 6 }]}>
            <Text style={styles.totalLabel}>Total TTC</Text>
            <Text style={styles.totalTtc}>{fmt(totals.totalTtc)}</Text>
          </View>
        </View>

        {/* Conditions */}
        {quote.paymentConditions && (
          <View style={[styles.section, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Conditions de paiement</Text>
            <Text style={styles.text}>{quote.paymentConditions}</Text>
          </View>
        )}

        {/* Mentions légales */}
        {quote.legalText && (
          <View style={styles.footer}>
            <Text>{quote.legalText}</Text>
          </View>
        )}
        {user.assurance && (
          <View style={styles.footer}>
            <Text>{user.assurance}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
