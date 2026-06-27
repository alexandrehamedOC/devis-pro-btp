import { z } from 'zod'

export const ClientSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export type ClientInput = z.infer<typeof ClientSchema>
