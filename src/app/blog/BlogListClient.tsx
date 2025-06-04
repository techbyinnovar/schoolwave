"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DateFormatter from '@/src/app/test_blog/components/date'; // Ensure this path is correct

// Define the Blog type (should match the one in page.tsx or a shared types file)
interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  // Add any other fields from Blog that are used in rendering the list
}

interface BlogListClientProps {
  posts: Blog[];
  fetchError: string | null;
}

export default function BlogListClient({ posts, fetchError }: BlogListClientProps) {
  useEffect(() => {
    if (fetchError) {
      console.error("[BROWSER_CONSOLE] Error fetching posts:", fetchError);
    }
    if (posts && posts.length > 0) {
      console.log("[BROWSER_CONSOLE] Blog posts data:", posts);
    } else if (!fetchError) {
      console.log("[BROWSER_CONSOLE] No blog posts found or posts array is empty.");
    }
  }, [posts, fetchError]);

  if (fetchError) {
    return (
      <div className='text-center py-10' style={{ color: 'red' }}>
        <h1>Error Loading Blog Posts</h1>
        <p>{fetchError}</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return <div className='text-center py-10'>No blog posts found.</div>;
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-[70%] mx-auto'>
      {posts.map((post: Blog) => (
        <div key={post.id} className='bg-white hover:bg-[#00164E] rounded-lg shadow-md overflow-hidden flex flex-col group'>
          <Link href={`/blog/${post.slug}`} className='block'>
            <div className='relative w-full aspect-[4/3] overflow-hidden'>
              {post.coverImage ? (
                <Image 
                  src={post.coverImage} 
                  alt={post.title || 'Blog post image'}
                  width={500}
                  height={375} // Adjusted for 4/3 aspect ratio
                  style={{ objectFit: 'cover' }} // Replaced objectFit prop with style
                  className='group-hover:scale-105 transition-transform duration-300 ease-in-out'
                  sizes='(min-width: 1024px) 23vw, (min-width: 768px) 35vw, 70vw'
                  priority={posts.indexOf(post) < 3} // Prioritize first few images
                />
              ) : (
                <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-400'>
                  <span>No Image Available</span>
                </div>
              )}
            </div>
          </Link>
          <div className='p-6 flex flex-col flex-grow'>
            <h2 className='text-xl font-semibold text-gray-800 mb-2 group-hover:text-white transition-colors duration-300'>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            {post.excerpt && (
              <p className='text-gray-600 text-sm mb-3 flex-grow group-hover:text-gray-300'>{post.excerpt.substring(0, 100)}{post.excerpt.length > 100 ? '...' : ''}</p>
            )}
            {post.publishedAt && (
              <p className='text-gray-500 text-xs mb-4 group-hover:text-gray-400'>
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
  );
}
