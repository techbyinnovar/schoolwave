import Footer from '@/components/Footer';
import Header from '@/components/Header';

import Link from 'next/link';
import Image from 'next/image';
import DateFormatter from '@/src/app/test_blog/components/date'; // Assuming DateFormatter is the correct name and path

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Define the Blog type based on Prisma model and API response
interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string; 
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
  author?: { name?: string | null; email?: string | null; }; // Optional author details
}

// Function to fetch posts from our Prisma backend
async function fetchPrismaPosts(): Promise<Blog[]> {
  console.log('[DEBUG] Entering fetchPrismaPosts...');
  // Construct the full URL
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; 
  const apiUrl = `${baseURL}/api/blogs`; 
  console.log(`[DEBUG] fetchPrismaPosts - Fetching from full URL: ${apiUrl}`); // Log the full URL
  try {
    const response = await fetch(apiUrl, { 
      cache: 'no-store', 
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[CLIENT_ERROR] fetchPrismaPosts - Failed to fetch posts from ${apiUrl}. Status: ${response.status}. Response: ${errorBody}`);
      throw new Error(`Failed to fetch posts. Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !data.data) { 
        console.error(`[CLIENT_ERROR] fetchPrismaPosts - Invalid data structure received from ${apiUrl}. Expected { data: [...] }, got:`, data);
        throw new Error('Invalid data structure received from API.');
    }
    console.log('[DEBUG] fetchPrismaPosts - Received data:', data);
    return data.data; 
  } catch (error: any) {
    console.error(`[CLIENT_ERROR] fetchPrismaPosts - Exception during fetch from ${apiUrl}. Error: ${error.message}`, error);
    if (error instanceof Error) throw error;
    throw new Error('An unexpected error occurred while fetching posts.');
  }
}

export default async function BlogsPage() {
  console.log('[DEBUG] Entering BlogsPage component...');
  let posts: Blog[] = [];
  let fetchError: string | null = null;

  try {
    posts = await fetchPrismaPosts();
    console.log('[DEBUG] BlogsPage - Posts fetched successfully:', posts);
  } catch (error: any) {
    console.error('[DEBUG] BlogsPage - Error fetching posts:', error);
    fetchError = error.message || 'Failed to load posts.';
  }

  if (fetchError) {
    return (
      <div className='bg-white min-h-screen'>
        <div className='bg-[#00164E] mb-6'>
          <Header />
        </div>
        <div className='text-center py-10' style={{ color: 'red' }}>
          <h1>Error Loading Blog Posts</h1>
          <p>{fetchError}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className='bg-white min-h-screen'>
        <div className='bg-[#00164E] mb-6'>
          <Header />
        </div>
        <div className='text-center py-10'>No blog posts found.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='bg-white min-h-screen'> {/* Ensure overall background is white */}
      <div className='bg-[#00164E] mb-6'>
        <Header />
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='text-3xl sm:text-4xl font-bold text-center mb-2 text-gray-800'>Our Blog</h1>
        <hr className='w-20 h-1 bg-gray-300 mx-auto mb-12'/>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-[70%] mx-auto'>
          {posts.map((post: Blog) => (
            <div key={post.id} className='bg-white hover:bg-[#00164E] rounded-lg shadow-md overflow-hidden flex flex-col '>
              <Link href={`/blog/${post.slug}`} className='block group'>
                <div className='relative w-full aspect-[4/3] overflow-hidden'> {/* Aspect ratio for image */}
                  {post.coverImage ? (
                    <Image 
                      src={post.coverImage} 
                      alt={post.title || 'Blog post image'}
                      width={500}
                      height={500}
                      objectFit='cover' 
                      className='group-hover:scale-105 transition-transform duration-300 ease-in-out'
                      sizes='(min-width: 1024px) 23vw, (min-width: 768px) 35vw, 70vw'
                    />
                  ) : (
                    <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-400'>
                      <span>No Image Available</span>
                    </div>
                  )}
                </div>
              </Link>
              <div className='p-6 flex flex-col flex-grow'>
                <h2 className='text-xl font-semibold text-gray-800 mb-2 group-hover:text-[#0045f6] transition-colors duration-300'>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.excerpt && (
                  <p className='text-gray-600 text-sm mb-3 flex-grow'>{post.excerpt.substring(0, 100)}{post.excerpt.length > 100 ? '...' : ''}</p>
                )}
                {post.publishedAt && (
                  <p className='text-gray-500 text-xs mb-4'>
                    <DateFormatter dateString={post.publishedAt} />
                  </p>
                )}
                <Link 
                  href={`/blog/${post.slug}`} 
                  className='mt-auto inline-block bg-gray-200 text-gray-700 hover:bg-[#0045f6] hover:text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 ease-in-out'>
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}