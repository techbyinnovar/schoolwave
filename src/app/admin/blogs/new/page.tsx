import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CreateBlogForm from '@/src/components/admin/blogs/CreateBlogForm';
import Link from 'next/link';

export default async function NewBlogPostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/admin/blogs/new');
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'CONTENT_ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          You do not have the necessary permissions to create a new blog post.
        </p>
        <Link href="/admin/blogs" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
          Back to Blog List
        </Link>
      </div>
    );
  }

  return (
    <>
      <CreateBlogForm />
    </>
  );
}
