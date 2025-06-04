import Footer from '@/components/Footer';
import Header from '@/components/Header';

import BlogListClient from './BlogListClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Define the Blog type - this should ideally be in a shared types file
// For now, ensure it includes fields needed by BlogListClient and fetchPrismaPosts
interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string; // Keep content if fetchPrismaPosts returns it, even if BlogListClient doesn't use it directly
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
  authorId: string;
  featured: boolean;
  category: string | null;
  keyphrase: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { name?: string | null; email?: string | null; };
}

// Function to fetch posts from our Prisma backend (remains the same)
async function fetchPrismaPosts(): Promise<Blog[]> {
  console.log('[SERVER_LOG] Entering fetchPrismaPosts...');
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const apiUrl = `${baseURL}/api/blogs`;
  console.log(`[SERVER_LOG] fetchPrismaPosts - Fetching from full URL: ${apiUrl}`);
  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store',
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[SERVER_ERROR] fetchPrismaPosts - Failed to fetch posts from ${apiUrl}. Status: ${response.status}. Response: ${errorBody}`);
      throw new Error(`Failed to fetch posts. Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !data.data) {
        console.error(`[SERVER_ERROR] fetchPrismaPosts - Invalid data structure received from ${apiUrl}. Expected { data: [...] }, got:`, data);
        throw new Error('Invalid data structure received from API.');
    }
    console.log('[SERVER_LOG] fetchPrismaPosts - Received data:', data.data.length, 'posts');
    return data.data;
  } catch (error: any) {
    console.error(`[SERVER_ERROR] fetchPrismaPosts - Exception during fetch from ${apiUrl}. Error: ${error.message}`, error);
    if (error instanceof Error) throw error;
    throw new Error('An unexpected error occurred while fetching posts.');
  }
}

export default async function BlogsPage() {
  console.log('[SERVER_LOG] Entering BlogsPage component (Server Component)...');
  let posts: Blog[] = [];
  let fetchError: string | null = null;

  try {
    posts = await fetchPrismaPosts();
    // The actual posts data will be logged in the browser by BlogListClient
  } catch (error: any) {
    console.error('[SERVER_ERROR] BlogsPage - Error fetching posts:', error.message);
    fetchError = error.message || 'Failed to load posts.';
  }

  // The Header and Footer will still be rendered by this Server Component
  // The main content (list of blogs or error message) will be handled by BlogListClient
  return (
    <div className='bg-white min-h-screen'>
      <div className='bg-[#00164E] mb-6 sticky top-0 z-50'> {/* Made header sticky */}
        <Header />
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='text-3xl sm:text-4xl font-bold text-center mb-2 text-gray-800'>Our Blog</h1>
        <hr className='w-20 h-1 bg-gray-300 mx-auto mb-12'/>
        
        {/* Use the Client Component to render the list and handle browser logging */}
        <BlogListClient posts={posts} fetchError={fetchError} />
      </div>
      
      <Footer />
    </div>
  );
}