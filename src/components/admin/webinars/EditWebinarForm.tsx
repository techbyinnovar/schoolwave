"use client";

import { useForm, useFieldArray, FieldPath, Controller } from 'react-hook-form';
import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { PlusCircle, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Webinar } from '@prisma/client'; // Assuming full Webinar type
import { UpdateWebinarSchema, UpdateWebinarFormData } from '@/lib/validators/webinarValidators';
import get from 'lodash/get';
import dynamic from 'next/dynamic';

const CloudinaryUploadWidget = dynamic(() => import('@/components/shared/CloudinaryUploadWidget'), {
  ssr: false,
  loading: () => <p>Loading uploader...</p> // Optional loading state
});

interface EditWebinarFormProps {
  webinar: Webinar; // Full Webinar object from Prisma
}

export default function EditWebinarForm({ webinar }: EditWebinarFormProps) {
  console.log('DEBUG: EditWebinarForm - Received webinar prop:', JSON.stringify(webinar, null, 2));
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format ISO dateTime string to YYYY-MM-DDTHH:mm for datetime-local input
  const formatDateTimeForInput = (isoDate: string | Date | null): string => {
    if (!isoDate) return '';
    try {
      const d = new Date(isoDate);
      // Format: YYYY-MM-DDTHH:mm
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      console.error("Error formatting date for input:", e);
      return '';
    }
  };

  const parseJsonArrayField = (field: any, defaultStructure: any = {}) => {
    if (field && Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Failed to parse JSON array field, defaulting to empty array:', field, e);
        return [];
      }
    }
    return [];
  };

  // Prepare default values, ensuring complex fields are correctly typed for the form
  const getDefaultValues = useCallback((w: Webinar): UpdateWebinarFormData => {
    const facilitators = parseJsonArrayField(w.facilitators).map(f => ({
      name: f?.name || '',
      title: f?.title || '',
      bio: f?.bio || '',
      imageUrl: f?.imageUrl || '',
    }));
    const learningObjectives = parseJsonArrayField((w as any).learningObjectives).map(lo => ({
      title: lo?.title || '',
      content: lo?.content || '',
    }));
    const targetAudience = parseJsonArrayField((w as any).targetAudience).map(ta => ({
      title: ta?.title || '',
      description: ta?.description || '',
    }));
    const whyAttendReasons = parseJsonArrayField((w as any).whyAttendReasons).map(war => (
      typeof war === 'string' ? { text: war } : { text: war?.text || '' } // Handles old string array and new object array
    ));

    return {
      title: w.title || '',
      slug: w.slug, // Slug is part of UpdateWebinarSchema, should be included
      subtitle: w.subtitle || undefined,
      description: w.description || undefined,
      coverImage: w.coverImage || undefined,
      dateTime: w.dateTime ? new Date(w.dateTime) : new Date(), // Schema expects Date
      durationMinutes: w.durationMinutes || 60,
      platform: w.platform || undefined,
      facilitators,
      learningObjectives,
      targetAudience,
      whyAttendReasons,
      isFree: w.isFree === null ? false : w.isFree,
      price: w.price === null ? undefined : w.price,
      attendeeLimit: w.attendeeLimit === null ? undefined : w.attendeeLimit,
      registrationOpen: w.registrationOpen === null ? true : w.registrationOpen,
      published: w.published === null ? false : w.published,
      category: w.category || undefined,
      tags: w.tags || undefined,
    };
  }, []); // No dependencies for getDefaultValues itself as it only uses its 'w' argument and parseJsonArrayField (which is stable or could also be memoized if needed)
  
  const defaultFormValues = getDefaultValues(webinar);
  console.log('DEBUG: EditWebinarForm - Calculated defaultValues for useForm:', JSON.stringify(defaultFormValues, null, 2));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid }, // isDirty and isValid can be used to enable/disable submit
    watch,
    reset, // To reset form with initial values
    setValue,
  } = useForm<UpdateWebinarFormData>({
    resolver: zodResolver(UpdateWebinarSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    reset(getDefaultValues(webinar));
  }, [webinar, reset, getDefaultValues]);

  const { fields: facilitatorFields, append: appendFacilitator, remove: removeFacilitator } = useFieldArray({
    control,
    name: "facilitators",
  });

  const { fields: learningObjectiveFields, append: appendLearningObjective, remove: removeLearningObjective } = useFieldArray({
    control,
    name: "learningObjectives",
  });

  const { fields: targetAudienceFields, append: appendTargetAudience, remove: removeTargetAudience } = useFieldArray({
    control,
    name: "targetAudience",
  });

  const { fields: whyAttendReasonFields, append: appendWhyAttendReason, remove: removeWhyAttendReason } = useFieldArray({
    control,
    name: "whyAttendReasons",
  });

  const isFreeWatched = watch("isFree");

  const onSubmit = async (data: UpdateWebinarFormData) => {
    setIsSubmitting(true);
    Swal.fire({
      title: 'Updating Webinar...', 
      text: 'Please wait.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // Ensure dateTime is a Date object if it's coming from a datetime-local input as string
    const processedData = {
        ...data,
        dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
        price: data.isFree ? null : data.price,
        // Ensure array fields are included, defaulting to empty arrays if undefined
        facilitators: data.facilitators || [],
        learningObjectives: data.learningObjectives || [],
        targetAudience: data.targetAudience || [],
        whyAttendReasons: data.whyAttendReasons || [],
    };

    // The UpdateWebinarSchema will strip out undefined fields if that's how it's configured (e.g. .partial())
    // Or, you can manually construct the payload with only defined fields if your API requires it.
    const payload: any = processedData;

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
  // Helper component props interfaces (ensure these are robust for nested fields)
  interface HelperFieldProps {
    name: FieldPath<UpdateWebinarFormData>; // Use FieldPath for strong typing of nested paths
    label: string;
    required?: boolean;
  }

  interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>, HelperFieldProps {
    required?: boolean;
  }
  const InputField = ({ name, label, type = 'text', required = false, ...props }: InputFieldProps) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <input id={name} type={type} {...register(name)} {...props} className={`mt-1 block w-full px-3 py-2 border ${get(errors, name) ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
      {get(errors, name) && <p className="mt-1 text-xs text-red-600">{get(errors, name)?.message?.toString()}</p>}
    </div>
  );

  interface TextAreaFieldProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>, HelperFieldProps {
    required?: boolean;
  }
  const TextAreaField = ({ name, label, required = false, ...props }: TextAreaFieldProps) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <textarea id={name} {...register(name)} {...props} rows={4} className={`mt-1 block w-full px-3 py-2 border ${get(errors, name) ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
      {get(errors, name) && <p className="mt-1 text-xs text-red-600">{get(errors, name)?.message?.toString()}</p>}
    </div>
  );

  interface CheckboxFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>, HelperFieldProps {
  }
  const CheckboxField = ({ name, label, ...props }: CheckboxFieldProps) => (
    <div className="mb-4 flex items-center">
      <input id={name} type="checkbox" {...register(name)} {...props} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-900">{label}</label>
      {get(errors, name) && <p className="ml-2 text-xs text-red-600">{get(errors, name)?.message?.toString()}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 shadow-xl rounded-xl">
      {/* Form fields are identical to CreateWebinarForm, pre-filled by defaultValues and reset effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField name="title" label="Title" required placeholder="e.g., Introduction to AI" />
        <InputField name="slug" label="Slug" required placeholder="e.g., introduction-to-ai" />
        <InputField name="subtitle" label="Subtitle (Optional)" placeholder="e.g., A beginner's guide" />
      </div>

      <TextAreaField name="description" label="Description (Optional)" placeholder="Detailed information about the webinar..." />

      {/* Cover Image Upload */}
      <Controller
        name="coverImage"
        control={control}
        defaultValue={webinar?.coverImage || ''} // Set initial value for Controller
        render={({ field, fieldState: { error: fieldError } }) => (
          <div>
            <CloudinaryUploadWidget
              label="Cover Image (Banner)"
              initialValue={field.value || ''} // Widget gets value from Controller
              onUploadSuccess={(result) => {
                setValue('coverImage', result.url, { shouldValidate: true, shouldDirty: true });
              }}
              onClear={() => {
                setValue('coverImage', '', { shouldValidate: true, shouldDirty: true });
              }}
              onUploadError={(uploadError) => {
                console.error('Cover image upload error:', uploadError);
                // Optionally, set a form error for coverImage
                // setError('coverImage', { type: 'manual', message: 'Upload failed' }); 
              }}
              folder="webinar_banners"
              resourceType="image"
              buttonText="Upload Banner Image"
              clearable={true}
            />
            {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError.message}</p>}
          </div>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField name="dateTime" label="Webinar Date and Time" type="datetime-local" required 
          // The value for datetime-local input needs to be in 'yyyy-MM-ddTHH:mm' format.
          // The defaultValues and reset logic now set dateTime as a Date object.
          // We need to ensure it's formatted correctly when passed to the input if the component doesn't handle Date objects directly.
          // However, react-hook-form often handles this conversion for controlled 'datetime-local' inputs if the value is a Date object.
          // For direct rendering or if issues arise, use: defaultValue={webinar.dateTime ? formatDateTimeForInput(webinar.dateTime) : ''}
          // But since it's a controlled component via register, RHF handles it.
        />
        <InputField name="durationMinutes" label="Duration (Minutes)" type="number" required placeholder="e.g., 60" />
      </div>

      <InputField name="platform" label="Platform / Location" required placeholder="e.g., Zoom, Google Meet, Conference Room A" />
      
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Facilitators</h3>
        {facilitatorFields.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative bg-gray-50">
            <InputField name={`facilitators.${index}.name` as FieldPath<UpdateWebinarFormData>} label={`Facilitator ${index + 1} Name`} required placeholder="John Doe" />
            <InputField name={`facilitators.${index}.title` as FieldPath<UpdateWebinarFormData>} label="Title/Role (Optional)" placeholder="Lead Developer" />
            <TextAreaField name={`facilitators.${index}.bio` as FieldPath<UpdateWebinarFormData>} label="Short Bio (Optional)" placeholder="Brief introduction..." rows={2} />
            <InputField name={`facilitators.${index}.imageUrl` as FieldPath<UpdateWebinarFormData>} label="Image URL (Optional)" type="url" placeholder="https://example.com/facilitator.png" />
            <button type="button" onClick={() => removeFacilitator(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <XCircle size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendFacilitator({ name: '', title: '', bio: '', imageUrl: '' })}
          className="mt-2 flex items-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:border-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" /> Add Facilitator
        </button>
        {get(errors, 'facilitators') && <p className="mt-1 text-xs text-red-600">{get(errors, 'facilitators')?.message?.toString() || get(errors, 'facilitators')?.root?.message?.toString()}</p>}
      </div>

      {/* Learning Objectives Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">What Attendees Will Learn (Learning Objectives)</h3>
        {learningObjectiveFields.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative bg-gray-50">
            <InputField name={`learningObjectives.${index}.title` as FieldPath<UpdateWebinarFormData>} label={`Objective ${index + 1} Title`} required placeholder="e.g., Understand core concepts" />
            <TextAreaField name={`learningObjectives.${index}.content` as FieldPath<UpdateWebinarFormData>} label={`Objective ${index + 1} Content`} required placeholder="Detailed explanation of what will be learned" rows={2} />
            <button type="button" onClick={() => removeLearningObjective(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <XCircle size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendLearningObjective({ title: '', content: '' })}
          className="mt-2 flex items-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:border-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" /> Add Learning Objective
        </button>
        {get(errors, 'learningObjectives') && <p className="mt-1 text-xs text-red-600">{get(errors, 'learningObjectives')?.message?.toString() || get(errors, 'learningObjectives')?.root?.message?.toString()}</p>}
      </div>

      {/* Target Audience Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Who Should Attend (Target Audience)</h3>
        {targetAudienceFields.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative bg-gray-50">
            <InputField name={`targetAudience.${index}.title` as FieldPath<UpdateWebinarFormData>} label={`Audience Group ${index + 1} Title`} required placeholder="e.g., Aspiring Developers" />
            <TextAreaField name={`targetAudience.${index}.description` as FieldPath<UpdateWebinarFormData>} label={`Audience Group ${index + 1} Description`} required placeholder="Description of this target group" rows={2} />
            <button type="button" onClick={() => removeTargetAudience(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <XCircle size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendTargetAudience({ title: '', description: '' })}
          className="mt-2 flex items-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:border-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" /> Add Target Audience Group
        </button>
        {get(errors, 'targetAudience') && <p className="mt-1 text-xs text-red-600">{get(errors, 'targetAudience')?.message?.toString() || get(errors, 'targetAudience')?.root?.message?.toString()}</p>}
      </div>

      {/* Why Attend Reasons Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Key Reasons to Attend</h3>
        {whyAttendReasonFields.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative bg-gray-50">
            <InputField name={`whyAttendReasons.${index}.text` as FieldPath<UpdateWebinarFormData>} label={`Reason ${index + 1}`} required placeholder="e.g., Gain practical skills" />
            <button type="button" onClick={() => removeWhyAttendReason(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <XCircle size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendWhyAttendReason({ text: '' })}
          className="mt-2 flex items-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:border-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" /> Add Reason to Attend
        </button>
        {get(errors, 'whyAttendReasons') && <p className="mt-1 text-xs text-red-600">{get(errors, 'whyAttendReasons')?.message?.toString() || get(errors, 'whyAttendReasons')?.root?.message?.toString()}</p>}
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
