import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export const RegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  name: z.string().min(2, 'Nom trop court'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm'],
  })
