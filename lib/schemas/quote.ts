import { z } from 'zod'

export const QuoteLineSchema = z.object({
  id: z.string().optional(),
  position: z.number().int().min(0),
  description: z.string().min(1, 'Description requise'),
  quantity: z.coerce.number().positive('Quantité invalide'),
  unit: z.string().min(1, 'Unité requise'),
  unitPriceHt: z.coerce.number().min(0, 'Prix invalide'),
  tvaRate: z.coerce.number().min(0).max(100, 'Taux TVA invalide'),
})

export const QuoteSchema = z.object({
  clientId: z.string().cuid('Client invalide'),
  title: z.string().min(2, 'Titre trop court'),
  introNote: z.string().optional(),
  paymentConditions: z.string().optional(),
  legalText: z.string().optional(),
  validUntil: z.coerce.date().optional(),
  lines: z.array(QuoteLineSchema).min(1, 'Au moins une ligne requise'),
})

export type QuoteInput = z.infer<typeof QuoteSchema>
export type QuoteLineInput = z.infer<typeof QuoteLineSchema>
