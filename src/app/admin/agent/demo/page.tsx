"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import withDemoAuth from '@/components/auth/withDemoAuth';

interface DemoVideo {
  url: string;
  title: string;
  description?: string | null;
}
interface DemoWithParsedVideos {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  videos: DemoVideo[] | null;
}

async function fetchDemosFromApi(): Promise<DemoWithParsedVideos[]> {
  const apiUrl = `/api/demos?published=true&page=1&limit=1000`;
  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch demos');
    const data = await response.json();
    if (!data || !data.demos) throw new Error('Invalid API response format: demos field missing.');
    return data.demos.map((demo: any) => {
      let parsedVideos: DemoVideo[] | null = null;
      if (demo.videos && typeof demo.videos === 'string') {
        try { parsedVideos = JSON.parse(demo.videos); } catch { /* ignore */ }
      } else if (Array.isArray(demo.videos)) {
        parsedVideos = demo.videos;
      }
      return { ...demo, videos: parsedVideos };
    });
  } catch (error: any) {
    throw error;
  }
}

function DemoListPageContent() {
  const { data: session } = useSession();
  const [demos, setDemos] = useState<DemoWithParsedVideos[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // AGENT referral link logic
  const isAgent = session?.user?.role === 'AGENT';
  const [generating, setGenerating] = useState(false);
  const [refCode, setRefCode] = useState<string | undefined>(session?.user?.referralCode);
  const referralLink = refCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/get_demo_code?ref=${refCode}` : '';

  useEffect(() => {
    setRefCode(session?.user?.referralCode);
  }, [session?.user?.referralCode]);

  const handleShareDemo = async () => {
    if (!refCode) {
      setGenerating(true);
      try {
        const res = await fetch('/api/get_demo_code/generate_for_agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: session?.user?.id }),
        });
        const data = await res.json();
        if (data.code) {
          setRefCode(data.code);
          const link = `${window.location.origin}/get_demo_code?ref=${data.code}`;
          await navigator.clipboard.writeText(link);
          setCopyStatus('Referral link generated & copied!');
        } else {
          setCopyStatus('Failed to generate referral link.');
        }
      } catch {
        setCopyStatus('Failed to generate referral link.');
      }
      setGenerating(false);
      setTimeout(() => setCopyStatus(null), 2000);
      return;
    }
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopyStatus('Referral link copied!');
      setTimeout(() => setCopyStatus(null), 2000);
    } catch {
      setCopyStatus('Failed to copy.');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };


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
          <Link href="/admin" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md transition-colors duration-150">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white sm:text-5xl">
              Explore Our Demos
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0">
              See our platform in action. Click on any demo to learn more.
            </p>
          </div>
          {isAgent && (
            <div className="flex flex-col items-center md:items-end">
              <button
                className="inline-flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow font-semibold transition mb-2 disabled:opacity-60"
                onClick={handleShareDemo}
                type="button"
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Share Demo'}
              </button>
              {copyStatus && (
                <span className="text-xs text-gray-700 dark:text-gray-300 mt-1">{copyStatus}</span>
              )}
            </div>
          )}
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
    </div>
  );
}

export default withDemoAuth(DemoListPageContent);
