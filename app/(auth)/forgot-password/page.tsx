'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { ForgotPasswordSchema } from '@/lib/schemas/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import type { z } from 'zod'

type FormData = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(ForgotPasswordSchema),
  })

  const onSubmit = async (data: FormData) => {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSent(true)
  }

  if (sent) {
    return (
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <Card>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Email envoyé</h2>
          <p style={{ color: 'var(--ink-muted)', marginBottom: 24 }}>
            Si un compte est associé à cette adresse, vous recevrez un lien dans quelques minutes.
          </p>
          <Link href="/login" style={{ color: 'var(--accent)' }}>Retour à la connexion</Link>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 4 }}>
          Mot de passe oublié
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem' }}>
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Adresse email" type="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" loading={isSubmitting} style={{ width: '100%' }}>
            Envoyer le lien
          </Button>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--ink-muted)', margin: 0 }}>
            <Link href="/login">Retour à la connexion</Link>
          </p>
        </form>
      </Card>
    </div>
  )
}
