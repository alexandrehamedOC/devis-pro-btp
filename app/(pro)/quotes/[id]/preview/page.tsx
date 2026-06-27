export const metadata = { title: 'Prévisualisation PDF — Devis Pro BTP' }

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', backgroundColor: 'var(--ink)', color: '#fff', flexShrink: 0 }}>
        <a href={`/quotes/${id}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Retour
        </a>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
        <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Prévisualisation PDF</span>
        <a
          href={`/api/quotes/${id}/pdf`}
          download
          style={{ marginLeft: 'auto', padding: '8px 16px', backgroundColor: 'var(--accent)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
        >
          Télécharger
        </a>
      </div>
      <iframe
        src={`/api/quotes/${id}/pdf`}
        style={{ flex: 1, border: 'none', width: '100%' }}
        title="Prévisualisation du devis PDF"
      />
    </div>
  )
}
