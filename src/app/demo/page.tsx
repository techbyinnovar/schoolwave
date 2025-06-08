
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Demo } from '@prisma/client'; // Import the Demo type
import Footer from '@/components/Footer';
import Header from '@/components/Header';

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

async function fetchDemosFromApi(): Promise<DemoWithParsedVideos[]> {
  let processedDemos: DemoWithParsedVideos[] = []; // Initialize to empty array
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  // Fetch all published demos by setting a high limit, adjust if proper pagination is needed on this page.
  const apiUrl = `${baseURL}/api/demos?published=true&page=1&limit=1000`; 
  console.log(`[DEMO_PAGE_LOG] Fetching from full URL: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store', // Or 'force-cache' or other caching strategies as needed
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[DEMO_PAGE_ERROR] Failed to fetch demos from ${apiUrl}. Status: ${response.status}. Response: ${errorBody}`);
      throw new Error(`Failed to fetch demos. Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.demos)) {
      console.error(`[DEMO_PAGE_ERROR] Invalid data structure received from ${apiUrl}. Expected { demos: [...] }, got:`, data);
      throw new Error('Invalid data structure received from API.');
    }
    console.log('[DEMO_PAGE_LOG] Received data:', data.demos.length, 'demos');
    const apiDemos = data.demos as Demo[]; // Extract demos array from API response

    // Manually parse the videos JSON field for each demo from the API
    processedDemos = apiDemos.map(demo => {
      let parsedVideos: DemoVideo[] | null = null;
      if (demo.videos && typeof demo.videos === 'string') { 
        try {
          parsedVideos = JSON.parse(demo.videos);
        } catch (e) {
          console.error(`Failed to parse videos JSON for demo ${demo.id}:`, e);
        }
      } else if (Array.isArray(demo.videos)) { 
          parsedVideos = demo.videos as unknown as DemoVideo[];
      }
      return { ...demo, videos: parsedVideos };
    });
    return processedDemos;
  } catch (error: any) {
    console.error(`[DEMO_PAGE_ERROR] Exception during fetch from ${apiUrl}. Error: ${error.message}`, error);
    // Ensure function throws or returns a value that indicates error, e.g., empty array or re-throw
    // For now, re-throwing will be caught by DemoListPage
    if (error instanceof Error) throw error;
    throw new Error('An unexpected error occurred while fetching demos.');
  }
  // If an error was thrown in the try block, it's propagated out.
  // If successful, processedDemos is returned from within the try block.
  // This path should ideally not be reached if logic is correct, 
  // but to satisfy all-paths-return and handle unexpected fall-through:
  return processedDemos; // Returns empty if fetch failed before assignment and error wasn't re-thrown, or populated if successful.
}

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request
export const fetchCache = 'force-no-store'; // Opt out of caching for fetch requests

export default async function DemoListPage() {
  let demos: DemoWithParsedVideos[] = [];
  let fetchError: string | null = null;

  try {
    demos = await fetchDemosFromApi();
  } catch (error: any) {
    console.error('[DEMO_PAGE_ERROR] DemoListPage - Error fetching demos:', error.message);
    fetchError = error.message || 'Failed to load demos.';
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className='bg-[#00164E] mb-6 sticky top-0 z-50'> {/* Made header sticky */}
             <Header />
           </div>
      <div className="container mx-auto px-4 py-12 w-[75%]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Explore Our Demos
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            See how Schoolwave can transform your educational institution. Each demo highlights key features and benefits.
          </p>
        </div>

        {fetchError ? (
          <p className="text-center text-red-500">Error: {fetchError}</p>
        ) : demos.length === 0 ? (
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
      <Footer/>
    </div>
  );
}
