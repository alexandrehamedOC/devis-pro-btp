import { QuoteEditorClient } from './QuoteEditorClient'

export const metadata = { title: 'Devis — Devis Pro BTP' }

export default function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  return <QuoteEditorClient paramsPromise={params} />
}
