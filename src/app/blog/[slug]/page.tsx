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
  try {
    const res = await fetch(`/api/blogs/${slug}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`Failed to fetch post '${slug}': ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch post: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching post '${slug}':`, error);
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
    <div className="min-h-screen flex flex-col bg-white">
      <div className='bg-[#00164E] sticky top-0 z-50'>
        <Header />
      </div>

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-4xl">
        <header className="mb-8 lg:mb-12 text-center">
          {post.category && (
            <p className="text-sm text-indigo-600 font-semibold tracking-wide uppercase mb-2">
              {post.category}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 text-sm text-gray-500">
            {post.author?.name && <span>By {post.author.name}</span>}
            {post.author?.name && post.publishedAt && <span className="mx-2">|</span>}
            {post.publishedAt && <DateFormatter dateString={post.publishedAt} />}
          </div>
        </header>

        {post.coverImage && (
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-8 lg:mb-12 shadow-lg">
            <Image 
              src={post.coverImage} 
              alt={post.title} 
              layout="fill" 
              objectFit="cover" 
              priority // Prioritize LCP element
            />
          </div>
        )}

        <div className="prose prose-indigo lg:prose-xl mx-auto">
          <ReactMarkdown remarkPlugins={[gfm]} rehypePlugins={[rehypeRaw]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {post.tags && post.tags.trim() !== '' && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Tags: {post.tags.split(',').map(tag => tag.trim()).join(', ')}
            </p>
          </div>
        )}
      </article>
      
      <Footer />
    </div>
  );
}
