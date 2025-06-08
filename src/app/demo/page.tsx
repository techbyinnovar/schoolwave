import { db as prisma } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Demo } from '@prisma/client'; // Import the Demo type

export const metadata: Metadata = {
  title: 'Product Demos | Schoolwave',
  description: 'Explore our product demos to see Schoolwave in action.',
};

interface DemoVideo {
    url: string;
    title: string;
    description?: string | null;
}
  
interface DemoWithParsedVideos extends Omit<Demo, 'videos'> {
    videos: DemoVideo[] | null;
}

async function getPublishedDemos(): Promise<DemoWithParsedVideos[]> {
  const demos = await prisma.demo.findMany({
    where: {
      published: true,
    },
    orderBy: [
      {
        priority: {
          sort: 'asc',
          nulls: 'last',
        },
      },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      title: true,
      description: true, // Keep description for potential snippets, though not explicitly used in card here
      coverImage: true,
      videos: true, // Fetch the Json field
      priority: true,
      published: true,
      createdAt: true,
      updatedAt: true, // Keep for completeness
    },
  });

  // Manually parse the videos JSON field
  return demos.map(demo => {
    let parsedVideos: DemoVideo[] | null = null;
    if (demo.videos && typeof demo.videos === 'string') { // Prisma might return JSON as string
      try {
        parsedVideos = JSON.parse(demo.videos);
      } catch (e) {
        console.error(`Failed to parse videos JSON for demo ${demo.id}:`, e);
        // Keep videos as null or an empty array if parsing fails
      }
    } else if (Array.isArray(demo.videos)) { // Or it might already be an array of objects
        parsedVideos = demo.videos as DemoVideo[];
    }
    return { ...demo, videos: parsedVideos };
  });
}

export default async function DemoListPage() {
  const demos = await getPublishedDemos();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Explore Our Demos
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            See how Schoolwave can transform your educational institution. Each demo highlights key features and benefits.
          </p>
        </div>

        {demos.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No demos are currently available. Please check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => (
              <Link href={`/demo/${demo.id}`} key={demo.id} className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="relative w-full h-48 sm:h-56">
                  <Image
                    src={demo.coverImage || '/images/placeholder-demo-cover.png'} // Provide a fallback image
                    alt={`Cover image for ${demo.title}`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                    {demo.title}
                  </h2>
                  {/* Optional: Show a snippet of the description 
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {demo.description || 'No description available.'}
                  </p>
                  */}
                  <div className="mt-4">
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {demo.videos?.length || 0} Video{(demo.videos?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
