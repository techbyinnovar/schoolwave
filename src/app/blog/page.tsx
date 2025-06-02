import Footer from '@/components/Footer';
import Header from '@/components/Header';

import Link from 'next/link';
import Image from 'next/image';
import Date from '@/src/app/test_blog/components/date';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Define the Blog type based on Prisma model and API response
interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string; // Or adjust if only excerpt is needed here
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null; // Assuming ISO string date
  authorId: string;
  featured: boolean;
  category: string | null;
  keyphrase: string | null;
  tags: string | null;
  createdAt: string; // Assuming ISO string date
  updatedAt: string; // Assuming ISO string date
}

// Function to fetch posts from our Prisma backend
async function fetchPrismaPosts(): Promise<Blog[]> {
  const response = await fetch('/api/blogs?published=true', {
    cache: 'no-store', // Ensure fresh data
  });
  if (!response.ok) {
    // Log the error or throw to be caught by the page's error boundary
    console.error('Failed to fetch posts:', await response.text());
    throw new Error('Failed to fetch posts');
  }
  const data = await response.json();
  return data.posts; // Assuming the API returns { posts: Blog[], total: number, ... }
}

export default async function BlogsPage() {
  try {
    const posts: Blog[] = await fetchPrismaPosts();
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

    const blogg = posts[0]; // Latest published post
    const featuredPosts = posts.filter(post => post.featured);
    const featured1 = featuredPosts[0] || (posts.length > 1 ? posts[1] : blogg); // Fallback for featured1

    return (
      <div className='bg-white'>
        <div className='bg-[#00164E] mb-6'>
          <Header />
        </div>
        <div className='w-full h-[50vh] sm:h-[75vh] lg:h-[80vh] bg-white hidden lg:block'>
          <article className='flex flex-col items-start justify-end mx-4 sm:mx-10 relative h-full'>
            <div 
              style={{ background: blogg.coverImage ? `linear-gradient(180deg, #1a1a1a00, #000000cd), url(${blogg.coverImage})` : 'linear-gradient(180deg, #1a1a1a00, #000000cd), #333', backgroundSize: 'cover', backgroundPosition: 'center'}}
              className='absolute inset-0 rounded-3xl z-0 p-4 sm:p-24 flex flex-col justify-end'>
              <Link href={`/blog/${blogg.slug}`} className='relative text-sm sm:text-md md:text-lg lg:text-lg py-2 px-4 sm:py-4 sm:px-8 bg-[#0045f6] border-white border text-white hover:text-[#0045f6] hover:bg-white rounded-full transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 self-start mb-4'>{blogg.category || "Uncategorized"}</Link>
              <Link href={`/blog/${blogg.slug}`} className='mt-2 sm:mt-6'>
                <h1 className='relative font-bold capitalize text-lg sm:text-xl md:text-3xl lg:text-5xl text-white w-full sm:w-[80%]'>
                  {blogg?.title}
                </h1>
                {/* <p className='hidden sm:block mt-4 md:text-lg lg:text-lg text-white w-full sm:w-[60%]'>
                  {blogg?.description}
                </p> */}
              </Link>
            </div>
          </article>
        </div>

        {/* FEATURED POSTS */}
        {featuredPosts.length > 0 && (
          <div className='p-4 sm:p-12 lg:p-24 relative mb-2'>
            <h1 className='text-2xl sm:text-4xl font-bold mb-6 sm:mb-12'>Featured Posts</h1>
            <div className='flex flex-col lg:flex-row gap-6 lg:gap-12'>
              <Link 
                href={`/blog/${featured1.slug}`} 
                style={{ background: featured1.coverImage ? `linear-gradient(180deg, #1a1a1a00, #000000cd), url(${featured1.coverImage})` : 'linear-gradient(180deg, #1a1a1a00, #000000cd), #333', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} 
                className='hidden lg:block w-full lg:w-[40%] rounded-2xl pl-4 pt-24 pb-8 pr-4 sm:pl-8 sm:pt-54 sm:pb-8 sm:pr-8 bg-cover bg-no-repeat'>
                <span className='text-sm sm:text-md lg:text-md py-2 px-4 sm:py-3 sm:px-8 bg-[#0045f6] border-white border text-white hover:text-[#0045f6] hover:bg-white rounded-full transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 w-auto'>{featured1.category || "Uncategorized"}</span>
                <h1 className='hidden lg:block text-2xl sm:text-4xl font-bold text-white mt-6 sm:mt-12'>{featured1.title}</h1>
              </Link>
              <div className='flex flex-col gap-6 w-full lg:w-[60%]'>
                {featuredPosts.map((item: Blog) => (
                  <div key={item.id} className=' gap-4 sm:gap-6'>
                    <Link href={`/blog/${item.slug}`} className='block lg:flex gap-4 sm:gap-6'>
                      <div className='relative w-full lg:w-[40%] aspect-[16/10] rounded-2xl overflow-hidden mb-4 lg:mb-0'>
                        {item.coverImage ? (
                          <Image src={item.coverImage} alt={item.title || 'blog image'} layout='fill' objectFit='cover' />
                        ) : (
                          <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-500'>No Image</div>
                        )}
                      </div>
                      <div className='w-full'>
                        <p className='text-[#0045f6]'>{item.category || 'Uncategorized'}</p>
                        <h1 className='text-lg sm:text-xl font-semibold w-full'>{item.title}</h1>
                        {item.publishedAt && 
                          <div className='mt-2 text-gray-500 text-sm'>
                            <Date dateString={item.publishedAt} />
                          </div>
                        }
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RECENT POSTS */}
        <div className='p-4 sm:p-12 lg:p-24 relative'>
          <div className='flex justify-between mb-6 sm:mb-12'>
            <h1 className='text-2xl sm:text-4xl font-bold'>Recent Posts</h1>
            <Link href="/blog" className='text-[#0045f6] underline'>View All</Link>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12'>
            {posts.map((post: Blog) => (
              <div key={post.id} className='rounded-2xl'>
                <div className='relative mb-4 sm:mb-5 h-[200px] sm:h-[250px] w-full rounded-xl overflow-hidden'>
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt={post.title || 'blog image'} layout='fill' objectFit='cover' />
                  ) : (
                    <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-500'>No Image</div>
                  )}
                </div>
                <span className='text-[#0045f6] font-normal'>{post.category || 'Uncategorized'}</span>
                <h1 className='text-lg sm:text-xl font-bold mb-2 mt-1'><Link href={`/blog/${post.slug}`}>{post.title}</Link></h1>
                {post.publishedAt && 
                  <div className='text-gray-500 text-sm'>
                    <Date dateString={post.publishedAt} />
                  </div>
                }
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return <div className='min-h-screen flex items-center justify-center'>Error loading posts. Please try again later.</div>;
  }
}