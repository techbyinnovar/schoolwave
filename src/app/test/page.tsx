import { fetchPosts } from '@/utils/pocketbase';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function TestPage() {
  try {
    console.log('Testing PocketBase connection...');
    const posts = await fetchPosts();
    console.log('Posts:', posts);

    return (
      <div className='p-8'>
        <h1 className='text-2xl font-bold mb-4'>PocketBase Test</h1>
        <pre className='bg-gray-100 p-4 rounded'>
          {JSON.stringify(posts, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    console.error('Error:', error);
    return (
      <div className='p-8'>
        <h1 className='text-2xl font-bold mb-4 text-red-600'>Error</h1>
        <pre className='bg-red-100 p-4 rounded'>
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }
}
