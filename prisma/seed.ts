import { prisma } from "./client";
import type { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function main() {
  // Clear existing users
  await prisma.user.deleteMany();
  // Clear existing stages
  await prisma.stage.deleteMany();

  const now = new Date();

  // Seed stages
  const stages = [
    { id: randomUUID(), name: 'NEW', order: 1, color: '#e0e7ff', updatedAt: now },
    { id: randomUUID(), name: 'CONTACTED', order: 2, color: '#fef3c7', updatedAt: now },
    { id: randomUUID(), name: 'QUALIFIED', order: 3, color: '#d1fae5', updatedAt: now },
    { id: randomUUID(), name: 'PROPOSAL', order: 4, color: '#f3e8ff', updatedAt: now },
    { id: randomUUID(), name: 'WON', order: 5, color: '#bbf7d0', updatedAt: now },
    { id: randomUUID(), name: 'LOST', order: 6, color: '#fecaca', updatedAt: now },
  ];
  
  for (const stage of stages) {
    // Use as any to bypass type checking issues due to schema drift
    await prisma.stage.create({ data: stage as any });
  }

  // Sample users with hashed passwords
  const users = [
    {
      id: randomUUID(),
      email: 'admin@schoolwave.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'ADMIN' as Role,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      email: 'contentadmin@schoolwave.com',
      password: await bcrypt.hash('content123', 10),
      name: 'Content Admin',
      role: 'CONTENT_ADMIN' as Role,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      email: 'agent@schoolwave.com',
      password: await bcrypt.hash('agent123', 10),
      name: 'Agent User',
      role: 'AGENT' as Role,
      updatedAt: now,
    },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user as any });
  }

  console.log('Seeded sample users and lead stages!');

  // Seed actions
  await prisma.action.createMany({
    data: [
      { id: randomUUID(), name: 'Call', updatedAt: now },
      { id: randomUUID(), name: 'Email', updatedAt: now },
      { id: randomUUID(), name: 'Meeting', updatedAt: now },
      { id: randomUUID(), name: 'Follow Up', updatedAt: now },
      { id: randomUUID(), name: 'WhatsApp', updatedAt: now },
      { id: randomUUID(), name: 'SMS', updatedAt: now },
    ],
    skipDuplicates: true,
  } as any); // Type assertion to bypass schema drift issues
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
