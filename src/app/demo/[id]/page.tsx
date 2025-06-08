import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Demo } from '@prisma/client'; // Assuming Demo type is from prisma client
import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DemoDetailClient from '@/components/demo/DemoDetailClient';

interface DemoVideo {
  url: string;
  title: string;
  description?: string | null;
}

interface DemoWithParsedVideos extends Omit<Demo, 'videos'> {
  videos: DemoVideo[] | null;
}

// Ensure fresh data on each request
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function fetchDemoFromApi(id: string): Promise<DemoWithParsedVideos | null> {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const apiUrl = `${baseURL}/api/demos/${id}`;
  
  console.log(`[DEMO_DETAIL_PAGE_LOG] Fetching demo ${id} from: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[DEMO_DETAIL_PAGE_LOG] Demo not found (API 404) for id: ${id}`);
        return null; // Will trigger notFound() in the page component
      }
      // For other errors, throw to be caught by the page component's error handling
      const errorText = await response.text();
      console.error(`[DEMO_DETAIL_PAGE_ERROR] API error fetching demo ${id}. Status: ${response.status}. Body: ${errorText}`);
      throw new Error(`Failed to fetch demo. Status: ${response.status}`);
    }

    const demoData = await response.json() as Demo;

    // Parse videos (assuming it's a JSON string from the API)
    let parsedVideos: DemoVideo[] | null = null;
    if (demoData.videos && typeof demoData.videos === 'string') {
      try {
        parsedVideos = JSON.parse(demoData.videos);
      } catch (e) {
        console.error(`[DEMO_DETAIL_PAGE_ERROR] Failed to parse videos JSON for demo ${demoData.id}:`, e);
        // Keep videos as null or handle as an error state if critical
      }
    } else if (Array.isArray(demoData.videos)) {
      // If API already returns parsed videos (e.g., if Prisma JSON protocol is 'json')
      parsedVideos = demoData.videos as unknown as DemoVideo[];
    }

    return { ...demoData, videos: parsedVideos };

  } catch (error: any) {
    console.error(`[DEMO_DETAIL_PAGE_ERROR] Exception during fetch for demo ${id}: ${error.message}`, error);
    // Re-throw to be caught by the page component's error handling
    throw error; 
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Fetching here is primarily for metadata. 
    // The page component will do its own fetch.
    // Consider if this fetch can be optimized or if error states for metadata need to be robust.
    const demo = await fetchDemoFromApi(params.id);

    if (!demo) {
      return {
        title: 'Demo Not Found | Schoolwave',
      };
    }

    return {
      title: `${demo.title} | Schoolwave Demos`,
      description: demo.description || `Watch our demo: ${demo.title}`,
    };
  } catch (error) {
    console.error(`[METADATA_ERROR] Failed to generate metadata for demo ${params.id}:`, error);
    return {
      title: 'Error Loading Demo | Schoolwave',
      description: 'There was an issue loading details for this demo.',
    };
  }
}

export default async function DemoDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  let demo: DemoWithParsedVideos | null = null;
  let fetchError: string | null = null;

  try {
    demo = await fetchDemoFromApi(id);
  } catch (error: any) {
    console.error(`[DEMO_DETAIL_PAGE_ERROR] Page-level error fetching demo ${id}:`, error.message);
    fetchError = error.message || `An unexpected error occurred while loading the demo.`;
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-500 mb-4">Error Loading Demo</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{fetchError}</p>
          <Link href="/demo" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md transition-colors duration-150">
            Back to Demos
          </Link>
        </div>
      </div>
    );
  }

  if (!demo) {
    // This will be triggered if fetchDemoFromApi returned null (e.g., API 404)
    // and no other error was caught by fetchError.
    notFound(); 
  }

  return (
    <div>
      <div className='bg-[#00164E] dark:bg-gray-900 mb-6 sticky top-0 z-50 shadow-md'>
        <Header />
      </div>
      <main className="container mx-auto px-4 py-8">
        {/* 
          The w-[75%] was causing horizontal scroll on smaller screens. 
          Using container mx-auto for better responsiveness.
          Adjust DemoDetailClient internal styling if specific width constraints are needed.
        */}
        <DemoDetailClient demo={demo} />
      </main>
      <Footer />
    </div>
  );
}