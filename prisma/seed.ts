import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create users
  const adminPassword = await hash('admin123', 10)
  const userPassword = await hash('user123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shortscut.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@shortscut.com',
      password: adminPassword,
      role: 'admin',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@shortscut.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@shortscut.com',
      password: userPassword,
      role: 'user',
    },
  })

  console.log('Created users:', { admin, user })

  // Create clients
  const acme = await prisma.client.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '555-123-4567',
      company: 'Acme Corporation',
      industry: 'Technology',
      address: '123 Main St, City, State, 12345',
      notes: 'Key client since 2022.',
      status: 'active',
    },
  })

  const globallabs = await prisma.client.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'Global Labs',
      email: 'info@globallabs.com',
      phone: '555-987-6543',
      company: 'Global Labs',
      industry: 'Research',
      address: '456 Science Blvd, City, State, 67890',
      notes: 'Interested in expanding social media presence.',
      status: 'active',
    },
  })

  console.log('Created clients:', { acme, globallabs })

  // Create contracts
  const contract1 = await prisma.contract.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'Social Media Campaign',
      clientId: '1',
      packageType: 'creator',
      startDate: new Date('2023-01-15'),
      endDate: new Date('2023-03-15'),
      totalMonths: 2,
      syncCallDay: 15,
      value: 5000,
      status: 'active',
      description: 'Comprehensive social media campaign across multiple platforms.',
      terms: 'Payment due within 30 days of invoice.',
      files: [],
    },
  })

  const contract2 = await prisma.contract.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      title: 'Brand Refresh',
      clientId: '2',
      packageType: 'studio',
      startDate: new Date('2023-02-01'),
      endDate: new Date('2023-04-01'),
      totalMonths: 2,
      syncCallDay: 1,
      value: 7500,
      status: 'active',
      description: 'Complete brand refresh including content strategy and execution.',
      terms: 'Payment in three installments.',
      files: [],
    },
  })

  console.log('Created contracts:', { contract1, contract2 })

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 