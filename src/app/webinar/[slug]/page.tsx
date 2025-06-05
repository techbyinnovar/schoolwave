import { prisma } from '../../../../prisma/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata, ResolvingMetadata } from 'next';
import { CalendarDays, Clock, Users, Video, Award, Tag } from 'lucide-react';

type Props = {
  params: { slug: string };
};

// Generate metadata for SEO
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const webinar = await prisma.webinar.findUnique({
    where: { slug },
    select: { title: true, description: true, coverImage: true },
  });

  if (!webinar) {
    return {
      title: 'Webinar Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: webinar.title,
    description: webinar.description?.substring(0, 160) || 'Join us for this exciting webinar!',
    openGraph: {
      title: webinar.title,
      description: webinar.description?.substring(0, 160) || 'Join us for this exciting webinar!',
      images: webinar.coverImage ? [{ url: webinar.coverImage }, ...previousImages] : previousImages,
    },
  };
}

// Generate static paths for better performance (optional, but good for SEO)
export async function generateStaticParams() {
  const webinars = await prisma.webinar.findMany({
    where: { published: true }, // Only generate for published webinars
    select: { slug: true },
  });
  return webinars.map((webinar) => ({ slug: webinar.slug }));
}

export default async function WebinarPage({ params }: Props) {
  const slug = params.slug;
  const webinar = await prisma.webinar.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } }, // Assuming you want to show author/host
    },
  });

  if (!webinar || !webinar.published) { // Also check if webinar is published
    notFound();
  }

  const { 
    title, 
    subtitle, 
    description, 
    coverImage, 
    dateTime, 
    durationMinutes, 
    platform, 
    facilitators, 
    isFree, 
    price, 
    category, 
    tags, 
    author 
  } = webinar;

  const formattedDate = new Date(dateTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 text-xl text-indigo-200">{subtitle}</p>}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {coverImage && (
            <div className="relative w-full h-64 md:h-96">
              <Image 
                src={coverImage} 
                alt={title} 
                fill 
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          )}

          <div className="p-6 md:p-10">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">About this Webinar</h2>
                {description ? (
                  <div className="prose prose-lg text-gray-700 max-w-none" dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }} />
                ) : (
                  <p className="text-gray-700">No description available.</p>
                )}
              </div>
              
              <aside className="space-y-6">
                <div className="bg-indigo-50 p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold text-indigo-700 mb-4">Details</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <CalendarDays size={20} className="mr-3 text-indigo-500" /> 
                      <span>{formattedDate}</span>
                    </li>
                    <li className="flex items-center">
                      <Clock size={20} className="mr-3 text-indigo-500" /> 
                      <span>{formattedTime}</span>
                    </li>
                    <li className="flex items-center">
                      <Video size={20} className="mr-3 text-indigo-500" /> 
                      <span>{platform}</span>
                    </li>
                    <li className="flex items-center">
                      <Users size={20} className="mr-3 text-indigo-500" /> 
                      <span>{durationMinutes} minutes</span>
                    </li>
                    <li className="flex items-center">
                      <Award size={20} className="mr-3 text-indigo-500" /> 
                      <span>Hosted by: {author?.name || 'N/A'}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold text-green-700 mb-2">
                    {isFree ? 'Free Webinar' : `Price: $${price}`}
                  </h3>
                  {!isFree && price === null && <p className='text-sm text-gray-600'>Contact us for pricing.</p>}
                  <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                    Register Now
                  </button>
                </div>
                
                {(category || tags) && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    {category && <p className="text-sm text-gray-600 mb-1"><Tag size={16} className="inline mr-1 text-gray-500"/>Category: {category}</p>}
                    {tags && <p className="text-sm text-gray-600">Tags: {tags}</p>}
                  </div>
                )}
              </aside>
            </div>

            {facilitators && facilitators.length > 0 && (
              <section className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Meet the Facilitators</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(facilitators as unknown as Array<{ name: string; title?: string; bio?: string; imageUrl?: string }>).map((facilitator, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
                      {facilitator.imageUrl && (
                        <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 ring-2 ring-indigo-500 ring-offset-2">
                          <Image src={facilitator.imageUrl} alt={facilitator.name} fill style={{objectFit: 'cover'}} />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-gray-800">{facilitator.name}</h3>
                      {facilitator.title && <p className="text-indigo-600 text-sm">{facilitator.title}</p>}
                      {facilitator.bio && <p className="text-gray-600 mt-2 text-sm">{facilitator.bio}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </footer>
    </div>
  );
}
