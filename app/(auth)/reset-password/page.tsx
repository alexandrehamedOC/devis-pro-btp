'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ResetPasswordSchema } from '@/lib/schemas/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import type { z } from 'zod'

type FormData = z.infer<typeof ResetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token')
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, token }),
    })
    if (res.ok) {
      router.push('/login?reset=1')
    } else {
      const json = await res.json()
      setError(json.error ?? 'Une erreur est survenue.')
    }
  }

  if (!token) {
    return (
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Card>
          <p style={{ color: 'var(--error)' }}>Lien invalide. <Link href="/forgot-password">Demandez un nouveau lien</Link>.</p>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 4 }}>
          Nouveau mot de passe
        </h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Nouveau mot de passe" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
          <Input label="Confirmer le mot de passe" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
          {error && <p role="alert" style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>{error}</p>}
          <Button type="submit" loading={isSubmitting} style={{ width: '100%' }}>
            Réinitialiser le mot de passe
          </Button>
        </form>
      </Card>
    </div>
  )
}
