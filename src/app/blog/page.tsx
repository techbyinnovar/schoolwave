import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { fetchPosts } from '@/utils/pocketbase';
import Link from 'next/link';
import Date from '@/src/app/test_blog/components/date';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function BlogsPage() {
  try {
    const posts = await fetchPosts();
    const blogg = posts[0];
    const featured = posts.filter(post => post.featured );
    const featured1 = featured[0] || {};

    return (
      <div className='bg-white'>
        <div className='bg-[#00164E] mb-6'>
          <Header />
        </div>
        <div className='w-full h-[50vh] sm:h-[75vh] lg:h-[80vh] bg-white hidden lg:block'>
          <article className='flex flex-col items-start justify-end mx-4 sm:mx-10 relative h-full'>
            <div 
              style={{ background: `linear-gradient(180deg, #1a1a1a00, #000000cd), url(https://rough-art.pockethost.io/api/files/o3dofvehqdj8cpp/${blogg.id}/${blogg.image})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
              className='absolute inset-0 rounded-3xl z-0 p-4 sm:p-24 flex flex-col justify-end'>
              <Link href={`/blog/${blogg?.url}`} className='relative text-sm sm:text-md md:text-lg lg:text-lg py-2 px-4 sm:py-4 sm:px-8 bg-[#0045f6] border-white border text-white hover:text-[#0045f6] hover:bg-white rounded-full transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 self-start mb-4'>{blogg.category || "Uncategorized"}</Link>
              <Link href={`/blog/${blogg?.url}`} className='mt-2 sm:mt-6'>
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
        {featured.length > 0 && (
          <div className='p-4 sm:p-12 lg:p-24 relative mb-2'>
            <h1 className='text-2xl sm:text-4xl font-bold mb-6 sm:mb-12'>Featured Posts</h1>
            <div className='flex flex-col lg:flex-row gap-6 lg:gap-12'>
              <Link 
                href={`/blog/${featured1.id}`} 
                style={{ background: `linear-gradient(180deg, #1a1a1a00, #000000cd), url(https://rough-art.pockethost.io/api/files/o3dofvehqdj8cpp/${featured1.id}/${featured1.image})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} 
                className='hidden lg:block w-full lg:w-[40%] rounded-2xl pl-4 pt-24 pb-8 pr-4 sm:pl-8 sm:pt-54 sm:pb-8 sm:pr-8 bg-cover bg-no-repeat'>
                <span className='text-sm sm:text-md lg:text-md py-2 px-4 sm:py-3 sm:px-8 bg-[#0045f6] border-white border text-white hover:text-[#0045f6] hover:bg-white rounded-full transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 w-auto'>{featured1.category || "Uncategorized"}</span>
                <h1 className='hidden lg:block text-2xl sm:text-4xl font-bold text-white mt-6 sm:mt-12'>{featured1.title}</h1>
              </Link>
              <div className='flex flex-col gap-6 w-full lg:w-[60%]'>
                {featured.map((item: any) => (
                  <div key={item?.id} className=' gap-4 sm:gap-6'>
                    <Link href={`/blog/${item.id}`} className='block lg:flex gap-4 sm:gap-6'>
                      <img src={`https://rough-art.pockethost.io/api/files/o3dofvehqdj8cpp/${item.id}/${item.image}`} alt='bg-image' className='rounded-2xl w-full sm:w-[40%] h-auto object-cover' />
                      <div className='w-full'>
                        <p className='text-[#0045f6]'>{item?.category}</p>
                        <h1 className='text-lg sm:text-xl w-full'>{item?.title}</h1>
                        <div className='mt-2 text-gray-500 text-sm'>
                          <Date dateString={item?.created} />
                        </div>
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
            {posts.map((post: any, id: any) => (
              <div key={id} className='rounded-2xl'>
                <div className='mb-4 sm:mb-5'>
                  <img src={`https://rough-art.pockethost.io/api/files/o3dofvehqdj8cpp/${post?.id}/${post?.image}`} alt='blog-image' className='rounded-xl h-[200px] sm:h-[250px] w-full object-cover' />
                </div>
                <span className='text-[#0045f6] font-normal'>{post?.category}</span>
                <h1 className='text-lg sm:text-xl font-bold mb-2 mt-1'><Link href={`/blog/${post.id}/`}>{post.title}</Link></h1>
                <div className='text-gray-500 text-sm'>
                  <Date dateString={post?.created} />
                </div>
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