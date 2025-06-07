"use client";

import Image from 'next/image';
import { useForm, useFieldArray, Controller, FieldPath } from 'react-hook-form';
import get from 'lodash/get';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { PlusCircle, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { useState } from 'react';
import { CreateWebinarSchema, CreateWebinarFormData } from '@/lib/validators/webinarValidators';
import dynamic from 'next/dynamic';

const CloudinaryUploadWidget = dynamic(() => import('@/components/shared/CloudinaryUploadWidget'), {
  ssr: false,
  loading: () => <p>Loading uploader...</p> // Optional loading state
});

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
    setError, // Added setError
  } = useForm<CreateWebinarFormData>({
    resolver: zodResolver(CreateWebinarSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      coverImage: '',
      // date: '', // Removed, replaced by dateTime
      // time: '', // Removed, replaced by dateTime
      dateTime: new Date(), // Default to now, or null if preferred and handled
      durationMinutes: 60,
      platform: '',
      facilitators: [],
      learningObjectives: [],
      targetAudience: [],
      whyAttendReasons: [],
      isFree: false,
      price: 0,
      attendeeLimit: undefined,
      registrationOpen: true,
      published: false,
      category: '',
      tags: '',
    },
  });

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

  const onSubmit = async (data: CreateWebinarFormData) => { // Keeping CreateWebinarFormData for now, as it should be compatible. The defaultValues were the primary issue.
    setIsSubmitting(true);
    Swal.fire({
      title: 'Creating Webinar...', 
      text: 'Please wait.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // dateTime is now directly from the form as a Date object due to z.coerce.date
    const payload = {
      ...data,
      price: data.isFree ? null : data.price,
      // Ensure facilitators, learningObjectives, targetAudience, whyAttendReasons are sent even if empty arrays
      // Zod default([]) should handle this, but good to be mindful for API contract
      facilitators: data.facilitators || [],
      learningObjectives: data.learningObjectives || [],
      targetAudience: data.targetAudience || [],
      whyAttendReasons: data.whyAttendReasons || [],
    };

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
  // Helper component props interfaces
  interface HelperFieldProps {
    name: FieldPath<CreateWebinarFormData>;
    label: string;
    required?: boolean;
  }

  interface HelperInputFieldProps extends HelperFieldProps {
    type?: string;
    placeholder?: string;
    [key: string]: any; // Allow other standard input props
  }

  const InputField: React.FC<HelperInputFieldProps> = ({ name, label, type = 'text', required = false, ...props }) => {
    const errorForField = get(errors, name);
    return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <input id={name} type={type} {...register(name)} {...props} className={`mt-1 block w-full px-3 py-2 border ${errorForField ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
      {errorForField && <p className="mt-1 text-xs text-red-600">{errorForField.message?.toString()}</p>}
    </div>
  );};

  interface HelperTextAreaFieldProps extends HelperFieldProps {
    placeholder?: string;
    [key: string]: any;
  }

  const TextAreaField: React.FC<HelperTextAreaFieldProps> = ({ name, label, required = false, ...props }) => {
    const errorForField = get(errors, name);
    return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <textarea id={name} {...register(name)} {...props} rows={4} className={`mt-1 block w-full px-3 py-2 border ${errorForField ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
      {errorForField && <p className="mt-1 text-xs text-red-600">{errorForField.message?.toString()}</p>}
    </div>
  );};

  interface HelperCheckboxFieldProps extends HelperFieldProps {
    [key: string]: any;
  }
  const CheckboxField: React.FC<HelperCheckboxFieldProps> = ({ name, label, ...props }) => {
    const errorForField = get(errors, name);
    return (
    <div className="mb-4 flex items-center">
      <input id={name} type="checkbox" {...register(name)} {...props} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-900">{label}</label>
      {errorForField && <p className="ml-2 text-xs text-red-600">{errorForField.message?.toString()}</p>}
    </div>
  );};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 shadow-xl rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField name="title" label="Title" required placeholder="e.g., Introduction to AI" />
        <InputField name="subtitle" label="Subtitle (Optional)" placeholder="e.g., A beginner's guide" />
      </div>

      <TextAreaField name="description" label="Description (Optional)" placeholder="Detailed information about the webinar..." />
      
      {/* Cover Image Upload */}
      <Controller
        name="coverImage"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div>
            <CloudinaryUploadWidget
              label="Cover Image (Banner)"
              initialValue={field.value || ''}
              onUploadSuccess={(result) => {
                setValue('coverImage', result.url, { shouldValidate: true, shouldDirty: true });
              }}
              onClear={() => {
                setValue('coverImage', '', { shouldValidate: true, shouldDirty: true });
              }}
              onUploadError={(uploadError) => {
                console.error('Cover image upload error:', uploadError);
                // Optionally, set a form error for coverImage if the Zod schema doesn't catch it
                // setError('coverImage', { type: 'manual', message: 'Upload failed' }); 
              }}
              folder="webinar_banners"
              resourceType="image" // Explicitly set to image for banners
              buttonText="Upload Banner Image"
              clearable={true}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
            {/* Display the URL as a hidden input or text for debugging if needed */}
            {/* {field.value && <p className="mt-1 text-xs text-gray-500">URL: {field.value}</p>} */}
          </div>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField name="dateTime" label="Webinar Date and Time" type="datetime-local" required />
        <InputField name="durationMinutes" label="Duration (Minutes)" type="number" required placeholder="e.g., 60" />
      </div>

      <InputField name="platform" label="Platform / Location" required placeholder="e.g., Zoom, Google Meet, Conference Room A" />
      
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Facilitators</h3>
        {facilitatorFields.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative bg-gray-50">
            <InputField name={`facilitators.${index}.name`} label={`Facilitator ${index + 1} Name`} required placeholder="John Doe" />
            <InputField name={`facilitators.${index}.title`} label="Title/Role (Optional)" placeholder="Lead Developer" />
            <TextAreaField name={`facilitators.${index}.bio`} label="Short Bio (Optional)" placeholder="Brief introduction..." rows={2} />
            <Controller
              name={`facilitators.${index}.imageUrl` as FieldPath<CreateWebinarFormData>}
              control={control}
              render={({ field, fieldState: { error: fieldError } }) => (
                <div>
                  <CloudinaryUploadWidget
                    label={`Facilitator ${index + 1} Image (Optional)`}
                    initialValue={typeof field.value === 'string' ? field.value : ''}
                    onUploadSuccess={(uploadResult) => {
                      setValue(`facilitators.${index}.imageUrl`, uploadResult.url, { shouldValidate: true, shouldDirty: true });
                    }}
                    onClear={() => {
                      setValue(`facilitators.${index}.imageUrl`, '', { shouldValidate: true, shouldDirty: true });
                    }}
                    onUploadError={(uploadError) => {
                      console.error(`Facilitator ${index + 1} image upload error:`, uploadError);
                      setError(`facilitators.${index}.imageUrl` as FieldPath<CreateWebinarFormData>, { type: 'manual', message: 'Upload failed. Please try again.' });
                    }}
                    folder="webinar_facilitators"
                    resourceType="image"
                    buttonText="Upload Image"
                    clearable={true}
                  />
                  {field.value && (
                    <div className="mt-2">
                      <Image src={typeof field.value === 'string' ? field.value : ''} alt={`Facilitator ${index + 1} Preview`} width={96} height={96} className="object-cover rounded-md shadow-sm" />
                    </div>
                  )}
                  {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError.message}</p>}
                </div>
              )}
            />
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
        {errors.facilitators && <p className="mt-1 text-xs text-red-600">{errors.facilitators.message || errors.facilitators.root?.message}</p>}
      </div>

      {/* Learning Objectives Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">What Attendees Will Learn (Learning Objectives)</h3>
        {learningObjectiveFields.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative bg-gray-50">
            <InputField name={`learningObjectives.${index}.title`} label={`Objective ${index + 1} Title`} required placeholder="e.g., Understand core concepts" />
            <TextAreaField name={`learningObjectives.${index}.content`} label={`Objective ${index + 1} Content`} required placeholder="Detailed explanation of what will be learned" rows={2} />
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
        {errors.learningObjectives && <p className="mt-1 text-xs text-red-600">{errors.learningObjectives.message || errors.learningObjectives.root?.message}</p>}
      </div>

      {/* Target Audience Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Who Should Attend (Target Audience)</h3>
        {targetAudienceFields.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative bg-gray-50">
            <InputField name={`targetAudience.${index}.title`} label={`Audience Group ${index + 1} Title`} required placeholder="e.g., Aspiring Developers" />
            <TextAreaField name={`targetAudience.${index}.description`} label={`Audience Group ${index + 1} Description`} required placeholder="Description of this target group" rows={2} />
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
        {errors.targetAudience && <p className="mt-1 text-xs text-red-600">{errors.targetAudience.message || errors.targetAudience.root?.message}</p>}
      </div>

      {/* "Why You Shouldn't Miss This" Section Content */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">&quot;Why You Shouldn&apos;t Miss This&quot; Section Content</h3>
        
        <TextAreaField 
          name="whyAttendParagraph" 
          label="Main Paragraph for 'Why Attend' Section (Optional)" 
          placeholder="Enter the main descriptive paragraph... (e.g., Unpaid fees are a growing crisis...)" 
          rows={4} 
        />
        {get(errors, 'whyAttendParagraph') && <p className="mt-1 text-xs text-red-600">{get(errors, 'whyAttendParagraph')?.message?.toString()}</p>}

        <InputField 
          name="whyAttendHighlight" 
          label="Final Highlight Point for 'Why Attend' Section (Optional)" 
          placeholder="Enter the final highlight text... (e.g., 🎓 Don't miss this free opportunity...)" 
        />
        {get(errors, 'whyAttendHighlight') && <p className="mt-1 text-xs text-red-600">{get(errors, 'whyAttendHighlight')?.message?.toString()}</p>}

        <h4 className="text-md font-medium text-gray-700 mt-6 mb-3">Detailed Reasons (e.g., &quot;You&apos;ll walk away with:&quot;) (Optional)</h4>
        {whyAttendReasonFields.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative bg-gray-50">
            <InputField 
              name={`whyAttendReasons.${index}.title`}
              label={`Reason ${index + 1} Title`} 
              required 
              placeholder="e.g., Actionable Strategies"
            />
            <TextAreaField 
              name={`whyAttendReasons.${index}.description`}
              label={`Reason ${index + 1} Description`} 
              required 
              placeholder="e.g., Learn X, Y, and Z to improve..." 
              rows={2}
            />
            <button type="button" onClick={() => removeWhyAttendReason(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <XCircle size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendWhyAttendReason({ title: '', description: '' })}
          className="mt-2 flex items-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:border-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" /> Add Detailed Reason
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
