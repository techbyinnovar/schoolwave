"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import Image from 'next/image';
import CloudinaryUploadWidget from '@/components/shared/CloudinaryUploadWidget';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import { ArrowLeft } from 'lucide-react';

const blogFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(200, 'Title must be 200 characters or less'),
  content: z.string().min(10, 'Content must be at least 10 characters long'),
  excerpt: z.string().max(500, 'Excerpt must be 500 characters or less').optional().nullable(),
  coverImage: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(), // Allow empty string or null
  published: z.boolean().optional(), // Default is handled by fetched data or initial defaultValues
  featured: z.boolean().optional(),
  category: z.string().max(100, 'Category must be 100 characters or less').optional().nullable(),
  keyphrase: z.string().max(200, 'Keyphrase must be 200 characters or less').optional().nullable(),
  tags: z.string().max(200, 'Tags (comma-separated) must be 200 characters or less').optional().nullable(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

interface EditBlogFormProps {
  postId: string;
}

const EditBlogForm: React.FC<EditBlogFormProps> = ({ postId }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset, // To set form values after fetching
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
        title: '',
        content: '',
        excerpt: '',
        coverImage: '',
        published: false,
        featured: false,
        category: '',
        keyphrase: '',
        tags: '',
      },
  });

  const coverImageValue = watch('coverImage');

  const handleUploadSuccess = (result: any) => {
    if (result.event === 'success') {
      setValue('coverImage', result.info.secure_url, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const fetchPostData = useCallback(async () => {
    setIsLoadingData(true);
    setErrorLoadingData(null);
    try {
      const response = await fetch(`/api/blogs/${postId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch blog post data');
      }
      const postData: BlogFormValues & { id: string } = await response.json();
      const typedPostData = postData as BlogFormValues & { featured?: boolean; category?: string | null; keyphrase?: string | null; tags?: string | null };
      reset({
        title: typedPostData.title,
        content: typedPostData.content,
        excerpt: typedPostData.excerpt || '',
        coverImage: typedPostData.coverImage || '',
        published: typedPostData.published || false,
        featured: typedPostData.featured || false,
        category: typedPostData.category || '',
        keyphrase: typedPostData.keyphrase || '',
        tags: typedPostData.tags || '',
      });
    } catch (err: any) {
      setErrorLoadingData(err.message);
      Swal.fire('Error', `Could not load post data: ${err.message}`, 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, [postId, reset]);

  useEffect(() => {
    if (postId) {
      fetchPostData();
    }
  }, [postId, fetchPostData]);

  const onSubmit: SubmitHandler<BlogFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/blogs/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update blog post');
      }

      Swal.fire({
        icon: 'success',
        title: 'Blog Post Updated!',
        text: `The post "${result.title}" has been successfully updated.`,
        timer: 2000,
        showConfirmButton: false,
      });
      router.push('/admin/blogs');
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error Updating Post',
        text: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingData) {
    return <div className="text-center py-10">Loading post data...</div>;
  }

  if (errorLoadingData) {
    return <div className="text-center py-10 text-red-500">Error loading data: {errorLoadingData}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Blog List
      </button>
      <h1 className="text-3xl font-semibold mb-6">Edit Blog Post</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 md:p-8">
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            {...register('title')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
          <textarea
            id="content"
            rows={10}
            {...register('content')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.content ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Optional)</label>
          <textarea
            id="excerpt"
            rows={3}
            {...register('excerpt')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.excerpt ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.excerpt && <p className="mt-1 text-xs text-red-500">{errors.excerpt.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="mt-2 flex items-center gap-x-4">
            <div className="w-1/3 h-48 relative bg-gray-100 rounded-md flex items-center justify-center">
              {coverImageValue ? (
                <Image
                  src={coverImageValue}
                  alt="Cover Image Preview"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-md"
                />
              ) : (
                <span className="text-gray-500 text-sm">No image</span>
              )}
            </div>
            <CloudinaryUploadWidget onUploadSuccess={handleUploadSuccess} />
          </div>
          {errors.coverImage && <p className="mt-1 text-xs text-red-500">{errors.coverImage.message}</p>}
        </div>

        {/* Category Input */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
          <input
            type="text"
            id="category"
            {...register('category')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
        </div>

        {/* Keyphrase Input */}
        <div className="mb-4">
          <label htmlFor="keyphrase" className="block text-sm font-medium text-gray-700 mb-1">Keyphrase (Optional)</label>
          <input
            type="text"
            id="keyphrase"
            {...register('keyphrase')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.keyphrase ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.keyphrase && <p className="mt-1 text-xs text-red-500">{errors.keyphrase.message}</p>}
        </div>

        {/* Tags Input */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma-separated, Optional)</label>
          <input
            type="text"
            id="tags"
            {...register('tags')}
            placeholder="e.g., tech, news, update"
            className={`mt-1 block w-full px-3 py-2 border ${errors.tags ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.tags && <p className="mt-1 text-xs text-red-500">{errors.tags.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="published" className="flex items-center">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Publish this post</span>
          </label>
        </div>

        <div className="mb-6">
          <label htmlFor="featured" className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              {...register('featured')}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Mark as featured post</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isLoadingData}
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Updating...' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlogForm;
