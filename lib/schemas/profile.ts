import { z } from 'zod'

export const ProfileSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  specialty: z.string().optional(),
  zone: z.string().optional(),
  about: z.string().optional(),
  phone: z.string().optional(),
  slug: z
    .string()
    .min(3, 'Slug trop court')
    .regex(/^[a-z0-9-]+$/, 'Lettres minuscules, chiffres et tirets uniquement'),
  siret: z.string().optional(),
  assurance: z.string().optional(),
  legalDefault: z.string().optional(),
  paymentDefault: z.string().optional(),
})

export type ProfileInput = z.infer<typeof ProfileSchema>
