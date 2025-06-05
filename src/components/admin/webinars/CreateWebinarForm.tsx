"use client";

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { PlusCircle, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { useState } from 'react';

// Zod Schema for Facilitator
const facilitatorSchema = z.object({
  name: z.string().min(1, "Facilitator name is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().url("Invalid URL for image").optional().or(z.literal(''))
});

// Zod Schema for Create Webinar Form
const createWebinarFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  subtitle: z.string().optional(),
  description: z.string().optional(), // Consider a WYSIWYG editor for this
  coverImage: z.string().url("Invalid URL format for cover image").optional().or(z.literal('')), 
  date: z.string().min(1, "Date is required"), // Will be combined with time to form dateTime
  time: z.string().min(1, "Time is required"),
  durationMinutes: z.coerce.number().int().positive("Duration must be a positive integer"),
  platform: z.string().min(1, "Platform is required (e.g., Zoom, Google Meet, Physical Location)"),
  facilitators: z.array(facilitatorSchema).optional().default([]),
  isFree: z.boolean().default(false),
  price: z.coerce.number().nonnegative("Price must be a non-negative number").optional(),
  attendeeLimit: z.coerce.number().int().positive("Attendee limit must be a positive integer").optional().nullable(),
  registrationOpen: z.boolean().default(true),
  published: z.boolean().default(false),
  category: z.string().optional(),
  tags: z.string().optional(), // Could be comma-separated, then processed
}).refine(data => {
  if (!data.isFree && (data.price === undefined || data.price === null || data.price < 0)) {
    return false;
  }
  return true;
}, {
  message: "Price is required and must be non-negative if the webinar is not free",
  path: ["price"],
});

type CreateWebinarFormData = z.infer<typeof createWebinarFormSchema>;

export default function CreateWebinarForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
    watch,
    setValue,
  } = useForm<CreateWebinarFormData>({
    resolver: zodResolver(createWebinarFormSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      coverImage: '',
      date: '',
      time: '',
      durationMinutes: 60,
      platform: '',
      facilitators: [],
      isFree: false,
      price: 0,
      attendeeLimit: null,
      registrationOpen: true,
      published: false,
      category: '',
      tags: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "facilitators",
  });

  const isFreeWatched = watch("isFree");

  const onSubmit = async (data: CreateWebinarFormData) => {
    setIsSubmitting(true);
    Swal.fire({
      title: 'Creating Webinar...', 
      text: 'Please wait.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const dateTime = `${data.date}T${data.time}:00`; // Assuming local time, adjust if UTC needed
    
    const payload = {
      ...data,
      dateTime,
      price: data.isFree ? null : data.price,
      // Tags might need to be split into an array if your backend expects that
      // For now, sending as string as per schema
    };
    // Remove date and time from payload as they are combined into dateTime
    delete (payload as any).date;
    delete (payload as any).time;

    try {
      const response = await fetch('/api/webinars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create webinar. API responded with an error.');
      }

      Swal.fire({
        icon: 'success',
        title: 'Webinar Created!',
        text: `Webinar "${result.title}" has been successfully created.`,
        timer: 2000,
        showConfirmButton: false,
      });
      router.push('/admin/webinars'); // Redirect to the list page
      router.refresh(); // Refresh server components
    } catch (error: any) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message || 'Something went wrong! Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Basic input field component for brevity
  const InputField = ({ name, label, type = 'text', required = false, ...props }: any) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <input id={name} type={type} {...register(name)} {...props} className={`mt-1 block w-full px-3 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]?.message?.toString()}</p>}
    </div>
  );

  const TextAreaField = ({ name, label, required = false, ...props }: any) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <textarea id={name} {...register(name)} {...props} rows={4} className={`mt-1 block w-full px-3 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]?.message?.toString()}</p>}
    </div>
  );

  const CheckboxField = ({ name, label, ...props }: any) => (
    <div className="mb-4 flex items-center">
      <input id={name} type="checkbox" {...register(name)} {...props} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-900">{label}</label>
      {errors[name] && <p className="ml-2 text-xs text-red-600">{errors[name]?.message?.toString()}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 shadow-xl rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField name="title" label="Title" required placeholder="e.g., Introduction to AI" />
        <InputField name="subtitle" label="Subtitle (Optional)" placeholder="e.g., A beginner's guide" />
      </div>

      <TextAreaField name="description" label="Description (Optional)" placeholder="Detailed information about the webinar..." />
      <InputField name="coverImage" label="Cover Image URL (Optional)" type="url" placeholder="https://example.com/image.png" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField name="date" label="Date" type="date" required />
        <InputField name="time" label="Time" type="time" required />
        <InputField name="durationMinutes" label="Duration (Minutes)" type="number" required placeholder="e.g., 60" />
      </div>

      <InputField name="platform" label="Platform / Location" required placeholder="e.g., Zoom, Google Meet, Conference Room A" />
      
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Facilitators</h3>
        {fields.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative bg-gray-50">
            <InputField name={`facilitators.${index}.name`} label={`Facilitator ${index + 1} Name`} required placeholder="John Doe" />
            <InputField name={`facilitators.${index}.title`} label="Title/Role (Optional)" placeholder="Lead Developer" />
            <TextAreaField name={`facilitators.${index}.bio`} label="Short Bio (Optional)" placeholder="Brief introduction..." rows={2} />
            <InputField name={`facilitators.${index}.imageUrl`} label="Image URL (Optional)" type="url" placeholder="https://example.com/facilitator.png" />
            <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <XCircle size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ name: '', title: '', bio: '', imageUrl: '' })}
          className="mt-2 flex items-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:border-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" /> Add Facilitator
        </button>
        {errors.facilitators && <p className="mt-1 text-xs text-red-600">{errors.facilitators.message || errors.facilitators.root?.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <CheckboxField name="isFree" label="This webinar is free" />
          {!isFreeWatched && (
            <InputField name="price" label="Price (USD)" type="number" step="0.01" required placeholder="e.g., 19.99" />
          )}
        </div>
        <InputField name="attendeeLimit" label="Attendee Limit (Optional)" type="number" placeholder="e.g., 100" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField name="category" label="Category (Optional)" placeholder="e.g., Technology, Marketing" />
        <InputField name="tags" label="Tags (Optional, comma-separated)" placeholder="e.g., AI, Machine Learning, Next.js" />
      </div>

      <div className="space-y-4">
         <CheckboxField name="registrationOpen" label="Open for Registration" />
         <CheckboxField name="published" label="Publish Immediately" />
      </div>

      <div className="flex justify-end pt-5 border-t border-gray-200">
        <button type="button" onClick={() => router.back()} className="mr-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors">
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting || !isDirty || !isValid}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : 'Create Webinar'}
        </button>
      </div>
    </form>
  );
}
