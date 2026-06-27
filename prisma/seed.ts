import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'demo@devis-pro-btp.fr'
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    console.log('Seed already done.')
    return
  }

  const passwordHash = await bcrypt.hash('Demo1234!', 12)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'Mohammed Al-Hassan',
      specialty: 'Maçonnerie & Gros œuvre',
      zone: 'Île-de-France',
      phone: '06 12 34 56 78',
      slug: 'hassan-btp',
      siret: '123 456 789 00012',
      legalDefault:
        "Conformément à la loi, tout acompte versé est acquis en cas d'annulation à l'initiative du client.",
      paymentDefault: 'Paiement à 30 jours date de facture. Acompte de 30% à la commande.',
    },
  })

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name: 'Marie Dupont',
      email: 'marie.dupont@example.com',
      phone: '06 98 76 54 32',
      address: '12 rue des Lilas, 75011 Paris',
    },
  })

  await prisma.quote.create({
    data: {
      userId: user.id,
      clientId: client.id,
      number: '2026-001',
      title: 'Rénovation salle de bains',
      introNote: 'Suite à notre visite du 15 juin 2026, voici notre proposition détaillée.',
      paymentConditions: user.paymentDefault ?? '',
      legalText: user.legalDefault ?? '',
      status: 'DRAFT',
      lines: {
        create: [
          {
            position: 0,
            description: 'Démolition carrelage existant',
            quantity: 12,
            unit: 'm²',
            unitPriceHt: 25,
            tvaRate: 10,
          },
          {
            position: 1,
            description: 'Fourniture et pose carrelage grès cérame 60x60',
            quantity: 12,
            unit: 'm²',
            unitPriceHt: 85,
            tvaRate: 10,
          },
          {
            position: 2,
            description: 'Installation receveur de douche à l\'italienne',
            quantity: 1,
            unit: 'u',
            unitPriceHt: 650,
            tvaRate: 10,
          },
        ],
      },
    },
  })

  console.log('Seed OK — utilisateur démo créé:', email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
