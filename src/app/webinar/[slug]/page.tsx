import { db as prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import WebinarClientContent, { ClientWebinarData } from './webinar-client-content'; // Import the new client component
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const webinar = await prisma.webinars.findUnique({
    where: { slug, published: true }, // Fetch only published webinars for metadata
    select: { title: true, description: true, coverImage: true },
  });

  if (!webinar) {
    return {
      title: 'Webinar Not Found',
      description: 'The webinar you are looking for could not be found or is not available.',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const pageTitle = `${webinar.title} | SchoolWave Webinar`;
  const pageDescription = webinar.description?.substring(0, 160) || `Join us for the exciting webinar: ${webinar.title}. Learn valuable insights and skills.`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: webinar.coverImage ? [{ url: webinar.coverImage }, ...previousImages] : previousImages,
      type: 'article',
    },
    alternates: {
      canonical: `/webinar/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const webinars = await prisma.webinars.findMany({
    where: { published: true }, // Only generate for published webinars
    select: { slug: true },
  });
  return webinars.map((webinar) => ({ slug: webinar.slug }));
}

export default async function WebinarPage({ params }: Props) {
  const slug = params.slug;
  const webinarWithAuthor = await prisma.webinars.findUnique({
    where: { slug },
    include: {
      User: { select: { name: true } }, // Corrected relation name
    },
  });

  if (!webinarWithAuthor) {
    notFound();
  }

  const { User, ...rest } = webinarWithAuthor;
  const webinar = { ...rest, author: User };

  if (!webinar || !webinar.published) { // Also check if webinar is published before displaying
    notFound();
  }

  // Cast to ClientWebinarData to satisfy prop types.
  // Ensure the 'include' statement above fetches all necessary fields for ClientWebinarData.
  return (
    <div className='bg-white min-h-screen'>
      <div className='bg-[#00164E] mb-6 sticky top-0 z-50'>

      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <WebinarClientContent webinar={webinar as ClientWebinarData} />
      </div>
      
      <Footer />
    </div>
  );
}
