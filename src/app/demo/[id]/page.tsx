"use client";

import { notFound } from 'next/navigation';
// import { Metadata } from 'next'; // Metadata export is for server components/pages
import { Demo } from '@prisma/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DemoDetailClient from '@/components/demo/DemoDetailClient';
import withDemoAuth from '@/components/auth/withDemoAuth';

interface DemoVideo {
  url: string;
  title: string;
  description?: string | null;
}
interface DemoWithParsedVideos extends Omit<Demo, 'videos'> {
  videos: DemoVideo[] | null;
}

// This function is called client-side within useEffect
async function fetchDemoFromApi(id: string): Promise<DemoWithParsedVideos | null> {
  const apiUrl = `/api/demos/${id}`;
  // console.log(`[DEMO_DETAIL_PAGE_LOG] Fetching demo ${id} from: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // console.log(`[DEMO_DETAIL_PAGE_LOG] Demo not found (API 404) for id: ${id}`);
        return null; 
      }
      const errorText = await response.text();
      console.error(`[DEMO_DETAIL_PAGE_ERROR] API error. Status: ${response.status}. URL: ${apiUrl}. Body: ${errorText}`);
      throw new Error(`Failed to fetch demo. Status: ${response.status}`);
    }

    const demoData = await response.json() as Demo;

    let parsedVideos: DemoVideo[] | null = null;
    if (demoData.videos && typeof demoData.videos === 'string') {
      try {
        parsedVideos = JSON.parse(demoData.videos);
      } catch (e) {
        console.error(`[DEMO_DETAIL_PAGE_ERROR] Failed to parse videos JSON for demo ${demoData.id}:`, e);
      }
    } else if (Array.isArray(demoData.videos)) {
      parsedVideos = demoData.videos as unknown as DemoVideo[];
    }

    return { ...demoData, videos: parsedVideos };

  } catch (error: any) {
    console.error(`[DEMO_DETAIL_PAGE_ERROR] Exception during fetch. URL: ${apiUrl}. Error: ${error.message}`, error);
    throw error; 
  }
}

/*
// generateMetadata is a Next.js feature for Server Components.
// For client components that fetch data dynamically after an auth check,
// metadata generation needs a different approach if it depends on that fetched data.
// For now, we will comment it out. You might set document.title in useEffect if needed,
// or explore middleware-based auth to keep pages server-renderable for metadata.

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const demo = await fetchDemoFromApi(params.id); // This fetch would run server-side
    if (!demo) {
      return { title: 'Demo Not Found | Schoolwave' };
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
*/

function DemoDetailPageContent({ params }: { params: { id: string } }) {
  const { id } = params;
  const [demo, setDemo] = useState<DemoWithParsedVideos | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDemo() {
      setIsLoading(true);
      try {
        const fetchedDemo = await fetchDemoFromApi(id);
        if (fetchedDemo === null) {
          notFound(); // Trigger Next.js not found mechanism if API returns 404
          return; 
        }
        setDemo(fetchedDemo);
      } catch (error: any) {
        setFetchError(error.message || `An unexpected error occurred while loading the demo.`);
      }
      setIsLoading(false);
    }
    loadDemo();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Demo Details...</p>
      </div>
    );
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

  // If !isLoading, !fetchError, and demo is still null, it means notFound() should have been called by useEffect.
  // This explicit check is a fallback or for clarity.
  if (!demo) {
      // This state should ideally be handled by the notFound() call in useEffect, which would unmount or redirect.
      // If this is rendered, it's a brief moment before notFound() takes full effect or an unexpected state.
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
             <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Demo not found or not available.</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className='bg-[#00164E] dark:bg-gray-900 sticky top-0 z-50 shadow-md'>
        <Header />
      </div>
      <main className="container mx-auto px-4 py-8 flex-grow">
        <DemoDetailClient demo={demo} />
      </main>
      <Footer />
    </div>
  );
}

export default withDemoAuth(DemoDetailPageContent);