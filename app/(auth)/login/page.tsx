import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Connexion — Devis Pro BTP' }

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 4 }}>
          Devis Pro BTP
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem' }}>
          Connectez-vous à votre espace
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
