"use client";

import Link from 'next/link';
import Image from 'next/image';
// import { Metadata } from 'next'; // Metadata is not typically used directly in client components this way
import { Demo } from '@prisma/client';
import { useState, useEffect } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
// import DemoCard from '@/components/demo/DemoCard'; // Using direct Link and Image for card structure
import withDemoAuth from '@/components/auth/withDemoAuth';

interface DemoVideo {
  url: string;
  title: string;
  description?: string | null;
}
interface DemoWithParsedVideos extends Omit<Demo, 'videos'> {
  videos: DemoVideo[] | null;
}

async function fetchDemosFromApi(): Promise<DemoWithParsedVideos[]> {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const apiUrl = `${baseURL}/api/demos?published=true&page=1&limit=1000`;
  // console.log(`[DEMO_LIST_PAGE_LOG] Fetching from: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[DEMO_LIST_PAGE_ERROR] API error. Status: ${response.status}. URL: ${apiUrl}. Body: ${errorBody}`);
      throw new Error(`Failed to fetch demos. Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !data.demos) {
      console.error(`[DEMO_LIST_PAGE_ERROR] API response missing 'demos' field. URL: ${apiUrl}. Response:`, data);
      throw new Error("Invalid API response format: 'demos' field missing.");
    }
    const apiDemos = data.demos as Demo[];

    const processedDemos: DemoWithParsedVideos[] = apiDemos.map(demo => {
      let parsedVideos: DemoVideo[] | null = null;
      if (demo.videos && typeof demo.videos === 'string') {
        try {
          parsedVideos = JSON.parse(demo.videos);
        } catch (e) {
          console.error(`[DEMO_LIST_PAGE_ERROR] Failed to parse videos JSON for demo ${demo.id}:`, e);
        }
      } else if (Array.isArray(demo.videos)) {
        parsedVideos = demo.videos as unknown as DemoVideo[];
      }
      return { ...demo, videos: parsedVideos };
    });
    return processedDemos;
  } catch (error: any) {
    console.error(`[DEMO_LIST_PAGE_ERROR] Exception during fetch. URL: ${apiUrl}. Error: ${error.message}`, error);
    if (error instanceof Error) throw error;
    throw new Error('An unexpected error occurred while fetching demos.');
  }
}

function DemoListPageContent() {
  const [demos, setDemos] = useState<DemoWithParsedVideos[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDemos() {
      setIsLoading(true);
      try {
        const fetchedDemos = await fetchDemosFromApi();
        setDemos(fetchedDemos);
      } catch (error: any) {
        setFetchError(error.message || 'Failed to load demos.');
      }
      setIsLoading(false);
    }
    loadDemos();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Demos...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-500 mb-4">Error Loading Demos</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{fetchError}</p>
          <Link href="/" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md transition-colors duration-150">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className='bg-[#00164E] dark:bg-gray-900 mb-6 sticky top-0 z-50 shadow-md'>
        <Header />
      </div>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white sm:text-5xl">
            Explore Our Demos
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See our platform in action. Click on any demo to learn more.
          </p>
        </div>

        {demos.length === 0 && !fetchError && !isLoading && (
          <div className="text-center py-10">
            <Image src="/images/no-data.svg" alt="No Demos" width={200} height={200} className="mx-auto mb-4" />
            <p className="text-xl text-gray-700 dark:text-gray-300">No demos available at the moment.</p>
            <p className="text-gray-500 dark:text-gray-400">Please check back later.</p>
          </div>
        )}

        {demos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demos.map((demo) => (
               <Link href={`/demo/${demo.id}`} key={demo.id} className="group block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl dark:hover:shadow-indigo-500/50 transition-all duration-300 ease-in-out">
                <div className="relative w-full h-48 sm:h-56">
                  <Image
                    src={demo.coverImage || '/images/placeholder-demo-cover.png'}
                    alt={`Cover image for ${demo.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                    {demo.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {demo.description || 'Click to learn more about this demo.'}
                  </p>
                  <div className="mt-4">
                    <span className="inline-block bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {demo.videos?.length || 0} Video{(demo.videos?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default withDemoAuth(DemoListPageContent);
