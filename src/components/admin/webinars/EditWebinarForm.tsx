"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { PlusCircle, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Webinar } from '@prisma/client'; // Assuming full Webinar type

// Zod Schema for Facilitator (can be reused or defined specifically for updates)
const facilitatorSchema = z.object({
  name: z.string().min(1, "Facilitator name is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().url("Invalid URL for image").optional().or(z.literal(''))
});

// Zod Schema for Edit Webinar Form (fields are optional for partial updates)
// However, for form UX, we might still want to enforce some if they were initially required.
const editWebinarFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long").optional(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coverImage: z.string().url("Invalid URL format for cover image").optional().or(z.literal('')).nullable(),
  date: z.string().min(1, "Date is required"), // For splitting dateTime
  time: z.string().min(1, "Time is required"), // For splitting dateTime
  durationMinutes: z.coerce.number().int().positive("Duration must be a positive integer").optional(),
  platform: z.string().min(1, "Platform is required").optional(),
  facilitators: z.array(facilitatorSchema).optional().nullable(),
  isFree: z.boolean().optional(),
  price: z.coerce.number().nonnegative("Price must be non-negative").optional().nullable(),
  attendeeLimit: z.coerce.number().int().positive("Attendee limit must be positive").optional().nullable(),
  registrationOpen: z.boolean().optional(),
  published: z.boolean().optional(),
  category: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
}).refine(data => {
  if (data.isFree === false && (data.price === undefined || data.price === null || data.price < 0)) {
    return false;
  }
  return true;
}, {
  message: "Price is required and must be non-negative if the webinar is not free",
  path: ["price"],
});

type EditWebinarFormData = z.infer<typeof editWebinarFormSchema>;

interface EditWebinarFormProps {
  webinar: Webinar; // Full Webinar object from Prisma
}

export default function EditWebinarForm({ webinar }: EditWebinarFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format ISO dateTime string to YYYY-MM-DD and HH:mm
  const formatDateTimeForInput = (isoDate: string | Date | null) => {
    if (!isoDate) return { date: '', time: '' };
    try {
      const d = new Date(isoDate);
      const date = d.toISOString().split('T')[0];
      const time = d.toTimeString().split(' ')[0].substring(0, 5); // HH:mm
      return { date, time };
    } catch (e) {
      console.error("Error formatting date:", e);
      return { date: '', time: '' };
    }
  };

  const { date: initialDate, time: initialTime } = formatDateTimeForInput(webinar.dateTime);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid }, // isDirty and isValid can be used to enable/disable submit
    watch,
    reset, // To reset form with initial values
  } = useForm<EditWebinarFormData>({
    resolver: zodResolver(editWebinarFormSchema),
    defaultValues: {
      title: webinar.title || '',
      subtitle: webinar.subtitle || '',
      description: webinar.description || '',
      coverImage: webinar.coverImage || '',
      date: initialDate,
      time: initialTime,
      durationMinutes: webinar.durationMinutes || 60,
      platform: webinar.platform || '',
      facilitators: webinar.facilitators && Array.isArray(webinar.facilitators)
        ? (webinar.facilitators as any[]).map(f => ({
            name: f?.name || '',
            title: f?.title || '',
            bio: f?.bio || '',
            imageUrl: f?.imageUrl || '',
          }))
        : [],
      isFree: webinar.isFree || false,
      price: webinar.price === null ? undefined : webinar.price, // Handle null for optional number
      attendeeLimit: webinar.attendeeLimit === null ? undefined : webinar.attendeeLimit,
      registrationOpen: webinar.registrationOpen === null ? true : webinar.registrationOpen,
      published: webinar.published || false,
      category: webinar.category || '',
      tags: webinar.tags || '',
    },
  });

  useEffect(() => {
    const { date, time } = formatDateTimeForInput(webinar.dateTime);
    reset({
      title: webinar.title || '',
      subtitle: webinar.subtitle || '',
      description: webinar.description || '',
      coverImage: webinar.coverImage || '',
      date: date,
      time: time,
      durationMinutes: webinar.durationMinutes || 60,
      platform: webinar.platform || '',
      facilitators: webinar.facilitators && Array.isArray(webinar.facilitators)
        ? (webinar.facilitators as any[]).map(f => ({
            name: f?.name || '',
            title: f?.title || '',
            bio: f?.bio || '',
            imageUrl: f?.imageUrl || '',
          }))
        : [],
      isFree: webinar.isFree || false,
      price: webinar.price === null ? undefined : webinar.price,
      attendeeLimit: webinar.attendeeLimit === null ? undefined : webinar.attendeeLimit,
      registrationOpen: webinar.registrationOpen === null ? true : webinar.registrationOpen,
      published: webinar.published || false,
      category: webinar.category || '',
      tags: webinar.tags || '',
    });
  }, [webinar, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "facilitators",
  });

  const isFreeWatched = watch("isFree");

  const onSubmit = async (data: EditWebinarFormData) => {
    setIsSubmitting(true);
    Swal.fire({
      title: 'Updating Webinar...', 
      text: 'Please wait.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const dateTime = `${data.date}T${data.time}:00`;
    
    const payload: any = {
      ...data,
      dateTime,
      price: data.isFree ? null : data.price,
    };
    delete payload.date;
    delete payload.time;

    // Only send fields that have changed (optional, API should handle partial updates)
    // For simplicity, sending all fields from the form.

    try {
      const response = await fetch(`/api/webinars/${webinar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update webinar.');
      }

      Swal.fire('Updated!', 'Webinar has been successfully updated.', 'success');
      router.push('/admin/webinars');
      router.refresh();
    } catch (error: any) {
      Swal.fire('Oops...', error.message || 'Something went wrong!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusing InputField, TextAreaField, CheckboxField from CreateWebinarForm (or define them here)
  // For brevity, assuming they are available or would be copied/imported.
  interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: keyof EditWebinarFormData;
    label: string;
    required?: boolean;
  }
  const InputField = ({ name, label, type = 'text', required = false, ...props }: InputFieldProps) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <input id={name} type={type} {...register(name)} {...props} className={`mt-1 block w-full px-3 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{(errors[name]?.message as string)}</p>}
    </div>
  );

  interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    name: keyof EditWebinarFormData;
    label: string;
    required?: boolean;
  }
  const TextAreaField = ({ name, label, required = false, ...props }: TextAreaFieldProps) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <textarea id={name} {...register(name)} {...props} rows={4} className={`mt-1 block w-full px-3 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{(errors[name]?.message as string)}</p>}
    </div>
  );

  interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: keyof EditWebinarFormData;
    label: string;
  }
  const CheckboxField = ({ name, label, ...props }: CheckboxFieldProps) => (
    <div className="mb-4 flex items-center">
      <input id={name} type="checkbox" {...register(name)} {...props} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-900">{label}</label>
      {errors[name] && <p className="ml-2 text-xs text-red-600">{(errors[name]?.message as string)}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 shadow-xl rounded-xl">
      {/* Form fields are identical to CreateWebinarForm, pre-filled by defaultValues and reset effect */}
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
        <InputField name_="tags" label="Tags (Optional, comma-separated)" placeholder="e.g., AI, Machine Learning, Next.js" />
      </div>

      <div className="space-y-4">
         <CheckboxField name="registrationOpen" label="Open for Registration" />
         <CheckboxField name="published" label="Publish Webinar" />
      </div>

      <div className="flex justify-end pt-5 border-t border-gray-200">
        <button type="button" onClick={() => router.back()} className="mr-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors">
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting || !isDirty } // Allow submit even if !isValid for partial updates, or use || !isValid if strict validation needed before submit
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </>
          ) : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
