import { db as prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import WebinarDetailsClient from './webinar-details-client'; // We'll create this next

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const webinar = await prisma.webinars.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  if (!webinar) {
    return { title: 'Webinar Not Found' };
  }
  return { title: `Details for ${webinar.title} | Admin` };
}

export default async function AdminWebinarDetailsPage({ params }: Props) {
  const webinarId = params.id;

  const webinar = await prisma.webinars.findUnique({
    where: { id: webinarId },
  });

  if (!webinar) {
    notFound();
  }

  const registrations = await prisma.webinar_registrations.findMany({
    where: { webinarId: webinarId },
    include: {
      Lead: true, // Include lead details for each registration
      User: { select: { name: true, email: true } }, // If linked to an internal user
    },
    orderBy: {
      registeredAt: 'desc',
    },
  });

  // We'll need to define the types for Webinar and Registrations with Lead details for the client component
  // For now, we cast to any to get started, and will create WebinarDetailsClient next.
  return <WebinarDetailsClient webinar={webinar as any} registrations={registrations as any} />;
}
