'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { ClientSchema, type ClientInput } from '@/lib/schemas/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface ClientFormProps {
  defaultValues?: Partial<ClientInput>
  clientId?: string
  onSuccess?: () => void
}

export function ClientForm({ defaultValues, clientId, onSuccess }: ClientFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const isEdit = !!clientId

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientInput>({
    resolver: zodResolver(ClientSchema),
    defaultValues,
  })

  const onSubmit = async (data: ClientInput) => {
    setServerError('')
    const res = await fetch(isEdit ? `/api/clients/${clientId}` : '/api/clients', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      if (onSuccess) {
        onSuccess()
      } else {
        const client = await res.json()
        router.push(`/clients/${client.id}`)
      }
    } else {
      setServerError('Une erreur est survenue. Réessayez.')
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label="Nom *" placeholder="Dupont Marie" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="marie@email.com" error={errors.email?.message} {...register('email')} />
        <Input label="Téléphone" type="tel" placeholder="06 12 34 56 78" error={errors.phone?.message} {...register('phone')} />
        <Input label="Adresse chantier" placeholder="12 rue des Lilas, 75011 Paris" error={errors.address?.message} {...register('address')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Notes internes</label>
          <textarea
            rows={3}
            placeholder="Préférences, remarques..."
            {...register('notes')}
            style={{
              padding: '10px 14px',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              resize: 'vertical',
              backgroundColor: 'var(--surface-card)',
              color: 'var(--ink)',
            }}
          />
        </div>

        {serverError && <p role="alert" style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{serverError}</p>}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Annuler</Button>
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Enregistrer' : 'Créer le client'}</Button>
        </div>
      </form>
    </Card>
  )
}
