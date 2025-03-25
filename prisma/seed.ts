import { PrismaClient, UserRole, OrganizationPlan, ClientStatus, ProjectStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Generate a random 5-digit code
const generateRandomCode = () => 
  (10000 + Math.floor(Math.random() * 90000)).toString();

async function main() {
  console.log('Starting seed...')

  // Create admin user (without organization)
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000000' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Admin User',
      role: UserRole.admin,
      phoneNumber: '+1234567890'
    }
  })
  console.log('Admin user created:', admin.id)

  // Create sample organization
  const organization = await prisma.organization.upsert({
    where: { code: '12345' },
    update: {},
    create: {
      code: '12345',
      name: 'Sample Client',
      company: 'Sample Company LLC',
      industry: 'Technology',
      plan: OrganizationPlan.studio,
      status: ClientStatus.active
    }
  })
  console.log('Sample organization created:', organization.id)

  // Create client user for the organization
  const userPassword = await hash('user123', 10)
  const clientUser = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Client User',
      role: UserRole.client,
      organizationId: organization.id,
      phoneNumber: '+1987654321'
    }
  })
  console.log('Client user created:', clientUser.id)

  // Create sample project
  const project = await prisma.project.create({
    data: {
      title: 'Sample Video Project',
      organizationId: organization.id,
      description: 'A sample video project for demonstration',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      status: 'writing' as ProjectStatus // Using the new project status
    }
  })
  console.log('Sample project created:', project.id)

  console.log('Seed completed successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 