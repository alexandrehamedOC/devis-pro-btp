import { ClientDetail } from './ClientDetail'

export const metadata = { title: 'Fiche client — Devis Pro BTP' }

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ClientDetail paramsPromise={params} />
}
