import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import EditBlogForm from '@/src/components/admin/blogs/EditBlogForm';
import Link from 'next/link';

interface EditBlogPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const session = await auth();
  const { id } = params;

  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/admin/blogs/edit/${id}`);
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'CONTENT_ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          You do not have the necessary permissions to edit this blog post.
        </p>
        <Link href="/admin/blogs" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
          Back to Blog List
        </Link>
      </div>
    );
  }

  if (!id) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-semibold text-red-600">Error</h1>
            <p className="mt-2 text-gray-600">Blog post ID is missing.</p>
            <Link href="/admin/blogs" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
                Back to Blog List
            </Link>
        </div>
    );
  }

  return (
    <>
      <EditBlogForm postId={id} />
    </>
  );
}
