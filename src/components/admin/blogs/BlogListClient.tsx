"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

interface Author {
  id: string;
  name: string | null;
  email: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  author: Author;
  createdAt: string;
  updatedAt: string;
}

interface BlogApiResponse {
  data: BlogPost[];
  meta: {
    totalPages: number;
    currentPage: number;
    limit: number;
    totalPosts: number;
  };
}

const BlogListClient = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchPosts = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/blogs?page=${page}&limit=10&publishedOnly=false`);
      if (!response.ok) {
        let errorMessage = `Failed to fetch blog posts. Status: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, log the raw text
          const rawText = await response.text();
          console.error('API response was not JSON:', rawText);
        }
        throw new Error(errorMessage);
      }
      const result: BlogApiResponse = await response.json();
      setPosts(result.data);
      setTotalPages(result.meta.totalPages);
      setCurrentPage(result.meta.currentPage);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [fetchPosts, currentPage]);

  const handleDelete = async (postId: string, postTitle: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the post: "${postTitle}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/blogs/${postId}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete post');
          }
          Swal.fire('Deleted!', 'The blog post has been deleted.', 'success');
          fetchPosts(currentPage); // Refresh the list
        } catch (err: any) {
          Swal.fire('Error!', err.message || 'Could not delete the post.', 'error');
        }
      }
    });
  };

  if (isLoading && posts.length === 0) {
    return <div className="text-center py-10">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Manage Blog Posts</h1>
        <Link href="/admin/blogs/new" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center">
          <PlusCircle size={20} className="mr-2" />
          Create New Post
        </Link>
      </div>

      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-10 text-gray-500">
          No blog posts found. 
          <Link href="/admin/blogs/new" className="text-blue-500 hover:underline ml-1">Create one now!</Link>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                        <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" title={`View post: ${post.title}`}>
                            {post.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/blogs/edit/${post.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Edit Post"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                <ChevronLeft size={20} className="mr-1" /> Previous
              </button>
              <span className="text-gray-700 mx-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                Next <ChevronRight size={20} className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogListClient;
