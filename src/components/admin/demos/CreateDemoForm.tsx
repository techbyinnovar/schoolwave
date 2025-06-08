'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DemoCreateFormSchema, DemoCreateFormData, VideoFormItemSchema, VideoItemSchema as TVideoItemSchema, VideoFormItemData } from '@/lib/schemas/demoSchemas';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import CloudinaryUploadWidget from '@/components/shared/CloudinaryUploadWidget'; // Ensure this path is correct
import Image from 'next/image';
import { TrashIcon, PlusCircleIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';

const CreateDemoForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<DemoCreateFormData>({
    resolver: zodResolver(DemoCreateFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      coverImage: '',
      videos: [{ title: '', url: '', description: '' }],
      priority: 10, // Default priority
      published: false,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'videos',
  });

  const watchedCoverImage = watch('coverImage');

  useEffect(() => {
    if (watchedCoverImage) {
      setCoverImageUrl(watchedCoverImage);
    } else {
      setCoverImageUrl(null);
    }
  }, [watchedCoverImage]);

  const onSubmit: SubmitHandler<DemoCreateFormData> = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    const dataToSubmit = {
      ...formData,
      coverImage: formData.coverImage === '' ? null : formData.coverImage,
      videos: formData.videos
        ? formData.videos
            .filter((videoItem: z.infer<typeof VideoFormItemSchema>): videoItem is z.infer<typeof TVideoItemSchema> => 
              !!(videoItem.url && typeof videoItem.url === 'string' && videoItem.url.trim() !== '' && 
                 videoItem.title && typeof videoItem.title === 'string' && videoItem.title.trim() !== ''))
            .map((filteredVideoItem: z.infer<typeof TVideoItemSchema>) => ({
              url: filteredVideoItem.url,
              title: filteredVideoItem.title,
              description: filteredVideoItem.description || null,
            }))
        : [],
      priority: formData.priority === undefined || formData.priority === null ? null : Number(formData.priority),
    };

    try {
      const response = await fetch('/api/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await Swal.fire('Success!', 'Demo created successfully!', 'success');
      reset(); // Reset form fields
      setCoverImageUrl(null);
      router.push('/admin/demos'); // Navigate to the demos list page
      router.refresh(); // Refresh server components
    } catch (e: any) {
      setError(e.message);
      Swal.fire('Error!', e.message || 'Failed to create demo.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" id="title" {...register('title')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" {...register('description')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">Cover Image URL</label>
        <div className="mt-1 flex items-center space-x-2">
          <input type="text" id="coverImage" {...register('coverImage')} placeholder="Enter URL or upload" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          <CloudinaryUploadWidget
            onUploadSuccess={(result) => setValue('coverImage', result.url, { shouldValidate: true })}
            buttonText="Upload"
          />
        </div>
        {errors.coverImage && <p className="text-red-500 text-xs mt-1">{errors.coverImage.message}</p>}
        {coverImageUrl && (
          <div className="mt-2 relative w-48 h-32">
            <Image src={coverImageUrl} alt="Cover preview" layout="fill" objectFit="cover" className="rounded" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Videos</label>
        {fields.map((field, index) => (
          <div key={field.id} className="mt-4 p-4 border border-gray-200 rounded-md space-y-3">
            <h4 className="text-md font-semibold text-gray-800">Video #{index + 1}</h4>
            <div>
              <label htmlFor={`videos.${index}.title`} className="block text-xs font-medium text-gray-600">Video Title</label>
              <input type="text" {...register(`videos.${index}.title`)} placeholder="Enter video title" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              {errors.videos?.[index]?.title && <p className="text-red-500 text-xs mt-1">{errors.videos[index]?.title?.message}</p>}
            </div>
            <div>
              <label htmlFor={`videos.${index}.url`} className="block text-xs font-medium text-gray-600">Video URL</label>
              <div className="mt-1 flex items-center space-x-2">
                <input type="text" {...register(`videos.${index}.url`)} placeholder="Enter video URL or upload" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                <CloudinaryUploadWidget
                  onUploadSuccess={(result) => setValue(`videos.${index}.url`, result.url, { shouldValidate: true })}
                  buttonText="Upload"
                  resourceType="video"
                />
              </div>
              {errors.videos?.[index]?.url && <p className="text-red-500 text-xs mt-1">{errors.videos[index]?.url?.message}</p>}
            </div>
            <div>
              <label htmlFor={`videos.${index}.description`} className="block text-xs font-medium text-gray-600">Video Description (Optional)</label>
              <textarea {...register(`videos.${index}.description`)} rows={2} placeholder="Short description for the video" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
              {errors.videos?.[index]?.description && <p className="text-red-500 text-xs mt-1">{errors.videos[index]?.description?.message}</p>}
            </div>
            <button type="button" onClick={() => remove(index)} className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <TrashIcon className="h-4 w-4 mr-1" /> Remove Video
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ title: '', url: '', description: '' } as VideoFormItemData)}
          className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Video
        </button>
        {errors.videos && typeof errors.videos.message === 'string' && (
            <p className="text-red-500 text-xs mt-1">{errors.videos.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority (lower number = higher priority)</label>
        <input type="number" id="priority" {...register('priority', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
      </div>

      <div className="flex items-center">
        <input id="published" type="checkbox" {...register('published')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-900">Published</label>
        {errors.published && <p className="text-red-500 text-xs ml-2">{errors.published.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? (
            <ArrowUpCircleIcon className="animate-spin h-5 w-5 mr-3" />
        ) : (
            'Create Demo'
        )}
      </button>
    </form>
  );
};

export default CreateDemoForm;
