import { db } from '@/lib/db';
import WebinarListClient from './components/WebinarListClient'; 
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webinars | SchoolWave',
  description: 'Browse upcoming and past webinars offered by SchoolWave.',
};

async function getAllPublishedWebinars() {
  try {
    const webinars = await db.webinars.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        coverImage: true,
        dateTime: true,
      },
      orderBy: {
        dateTime: 'desc', 
      },
    });
    return webinars;
  } catch (error) {
    console.error('Failed to fetch webinars:', error);
    return []; 
  }
}

export default async function WebinarListPage() {
  const webinars = await getAllPublishedWebinars();

  return (
    <WebinarListClient webinars={webinars} />
  );
}