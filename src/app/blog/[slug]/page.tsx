"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DateFormatter from '@/src/app/test_blog/components/date'; // Verify this path

// Consider moving to a shared types file, e.g., src/types/blog.ts
interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
  author: {
    name: string | null;
  } | null;
  featured: boolean;
  category: string | null;
  keyphrase: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

async function getPost(slug: string): Promise<Blog | null> {
  const apiUrl = `/api/blogs/${slug}`;
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[CLIENT_ERROR] getPost - Failed to fetch post '${slug}' from ${apiUrl}. Status: ${res.status}. Response: ${errorBody}`);
      if (res.status === 404) return null; // Specific handling for 404
      throw new Error(`Failed to fetch post: ${res.statusText}. Status: ${res.status}`);
    }
    // It's good practice to also check if the response is actually JSON
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const postData = await res.json();
        if (!postData || typeof postData.id === 'undefined') { // Basic check for a valid post object
            console.error(`[CLIENT_ERROR] getPost - Invalid post data structure received from ${apiUrl} for slug '${slug}'. Got:`, postData);
            throw new Error('Invalid post data structure received from API.');
        }
        return postData;
    } else {
        const textResponse = await res.text();
        console.error(`[CLIENT_ERROR] getPost - Expected JSON response from ${apiUrl} for slug '${slug}', but got ${contentType}. Response: ${textResponse}`);
        throw new Error(`Unexpected response type from API: ${contentType}`);
    }
  } catch (error: any) {
    console.error(`[CLIENT_ERROR] getPost - Exception during fetch for slug '${slug}' from ${apiUrl}. Error: ${error.message}`, error);
    // If already an Error object, rethrow it, otherwise wrap it
    if (error instanceof Error) throw error; // Re-throw to be handled by useEffect's catch or component boundary
    // For other types of errors caught here, returning null might be appropriate if the page can handle it
    // Or re-throw a new generic error if it should propagate to an error boundary
    return null; 
  }
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [post, setPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchPostData = async () => {
        setLoading(true);
        setError(null);
        const fetchedPost = await getPost(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
        } else {
          setError('Blog post not found or failed to load.');
        }
        setLoading(false);
      };
      fetchPostData();
    } else if (params && typeof params.slug !== 'string') {
      // Handle case where slug might not be available or is not a string initially
      // This might happen during Next.js hydration or if params are not immediately ready
      // console.warn('Slug is not available or not a string:', params.slug);
      // setLoading(false); // Potentially stop loading if slug is definitively invalid/missing
      // setError('Invalid blog post URL.');
    }
  }, [slug, params]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className='bg-[#00164E] sticky top-0 z-50'>
          <Header />
        </div>
        <div className="flex-grow flex items-center justify-center text-gray-700">Loading post...</div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className='bg-[#00164E] sticky top-0 z-50'>
          <Header />
        </div>
        <div className="flex-grow flex items-center justify-center text-red-500">
          {error || 'Blog post not found.'}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white ">
      <div className='bg-[#00164E] sticky top-0 z-50'>
        <Header />
      </div>

      <main className="py-8 lg:py-12">
        <article className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* 1. Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4 lg:mb-6">
            {post.title}
          </h1>

          {/* 2. Meta: Author, Date, Category */}
          <div className="mb-6 lg:mb-8 text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
            {post.author?.name && (
                <span>By {post.author.name}</span>
            )}
            {post.publishedAt && (
              <>
                {post.author?.name && <span className="hidden sm:inline">&bull;</span>} {/* Separator only if author is also present */}
                <DateFormatter dateString={post.publishedAt} />
              </>
            )}
            {post.category && (
              <>
                {(post.author?.name || post.publishedAt) && <span className="hidden sm:inline">&bull;</span>} {/* Separator if any prior item is present */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {post.category}
                </span>
              </>
            )}
          </div>

          {/* 3. Cover Image */}
          {post.coverImage && (
            <div
              className="w-full aspect-[16/9] rounded-lg overflow-hidden mb-8 lg:mb-12 shadow-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${post.coverImage})` }}
              aria-label={`${post.title} cover image`}
            />
          )}

          {/* 4. Text Content */}
          <div className="prose prose-indigo lg:prose-xl max-w-none"> {/* max-w-none to allow prose to fill container */}
            <ReactMarkdown remarkPlugins={[gfm]} rehypePlugins={[rehypeRaw]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.trim() !== '' && (
            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Tags: {post.tags.split(',').map(tag => tag.trim()).join(', ')}
              </p>
            </div>
          )}
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
