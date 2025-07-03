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

  // Add debug logging to see what's in the database
  console.log('Fetching registrations for webinar:', webinarId);
  
  const registrations = await prisma.webinar_registrations.findMany({
    where: { webinarId: webinarId },
    include: {
      Lead: true, // Use uppercase 'Lead' to match the Prisma schema
      User: { select: { name: true, email: true } }, // If linked to an internal user
    },
    orderBy: {
      registeredAt: 'desc',
    },
  });
  
  // Debug log the first registration to see its structure
  if (registrations.length > 0) {
    console.log('First registration structure:', JSON.stringify(registrations[0], null, 2));
    console.log('Lead data exists?', !!registrations[0].Lead);
    if (registrations[0].Lead) {
      console.log('Lead data fields:', Object.keys(registrations[0].Lead));
    }
  } else {
    console.log('No registrations found for this webinar');
  }

  // Map the registrations data to match the expected format in the client component
  const mappedRegistrations = registrations.map(reg => {
    // Explicitly map Lead to lead for the client component
    const { Lead, ...rest } = reg;
    return {
      ...rest,
      lead: Lead // Map uppercase Lead to lowercase lead for the client
    };
  });

  return <WebinarDetailsClient webinar={webinar as any} registrations={mappedRegistrations as any} />;
}
