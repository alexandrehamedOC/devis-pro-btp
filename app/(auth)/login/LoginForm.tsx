'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LoginSchema } from '@/lib/schemas/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import type { z } from 'zod'

type FormData = z.infer<typeof LoginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push(redirect)
      router.refresh()
    } else if (res.status === 429) {
      setServerError('Trop de tentatives — réessayez dans quelques minutes.')
    } else {
      setServerError('Email ou mot de passe incorrect.')
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input
          label="Adresse email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && (
          <p role="alert" style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} style={{ width: '100%' }}>
          Se connecter
        </Button>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--ink-muted)', margin: 0 }}>
          <Link href="/forgot-password">Mot de passe oublié ?</Link>
        </p>
      </form>
    </Card>
  )
}
