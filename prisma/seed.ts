import { prisma } from "./client";
import type { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';


async function main() {
  // Clear existing users
  await prisma.user.deleteMany();
  // Clear existing stages
  await prisma.stage.deleteMany();

  // Seed stages
  const stages = [
    { name: 'NEW', order: 1, color: '#e0e7ff' },
    { name: 'CONTACTED', order: 2, color: '#fef3c7' },
    { name: 'QUALIFIED', order: 3, color: '#d1fae5' },
    { name: 'PROPOSAL', order: 4, color: '#f3e8ff' },
    { name: 'WON', order: 5, color: '#bbf7d0' },
    { name: 'LOST', order: 6, color: '#fecaca' },
  ];
  for (const stage of stages) {
    await prisma.stage.create({ data: stage });
  }

  // Sample users with hashed passwords
  const users = [
    {
      email: 'admin@schoolwave.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'ADMIN' as Role,
    },
    {
      email: 'contentadmin@schoolwave.com',
      password: await bcrypt.hash('content123', 10),
      name: 'Content Admin',
      role: 'CONTENT_ADMIN' as Role,
    },
    {
      email: 'agent@schoolwave.com',
      password: await bcrypt.hash('agent123', 10),
      name: 'Agent User',
      role: 'AGENT' as Role,
    },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  console.log('Seeded sample users and lead stages!');

  // Seed actions
  await prisma.action.createMany({
    data: [
      { name: 'Call' },
      { name: 'Email' },
      { name: 'Meeting' },
      { name: 'Follow Up' },
      { name: 'WhatsApp' },
      { name: 'SMS' },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
