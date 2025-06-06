import { z } from 'zod';

// Schema for a single Facilitator
export const FacilitatorSchema = z.object({
  name: z.string().min(1, 'Facilitator name is required'),
  title: z.string().min(1, 'Facilitator title is required'),
  bio: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

// Schema for a single Learning Objective
export const LearningObjectiveSchema = z.object({
  title: z.string().min(1, 'Objective title is required'),
  content: z.string().min(1, 'Objective content is required'),
});

// Schema for a single Target Audience item
export const TargetAudienceItemSchema = z.object({
  title: z.string().min(1, 'Audience title is required'),
  description: z.string().min(1, 'Audience description is required'),
  // icon: z.string().optional(), // Add if you plan to use icons
});

// Main schema for creating a webinar
export const CreateWebinarSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  slug: z.string().min(3, 'Slug must be at least 3 characters long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and contain only letters, numbers, and hyphens'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().url('Invalid cover image URL').optional(),
  dateTime: z.coerce.date({
    required_error: 'Date and time are required',
    invalid_type_error: 'Invalid date and time format',
  }),
  durationMinutes: z.coerce.number().int().positive('Duration must be a positive number').optional(),
  platform: z.string().optional(),
  
  facilitators: z.array(FacilitatorSchema).optional(),
  learningObjectives: z.array(LearningObjectiveSchema).optional(),
  targetAudience: z.array(TargetAudienceItemSchema).optional(),
  whyAttendReasons: z.array(z.object({ text: z.string().min(1, 'Reason text cannot be empty') })).optional(),

  isFree: z.boolean().default(true),
  price: z.coerce.number().positive('Price must be a positive number').optional(),
  attendeeLimit: z.coerce.number().int().positive('Attendee limit must be a positive number').optional(),
  registrationOpen: z.boolean().default(true),
  published: z.boolean().default(false),
  
  category: z.string().optional(),
  tags: z.string().optional(), // Could be refined to an array of strings
  // authorId: z.string().optional(), // Assuming author is set server-side or from session
});

export type CreateWebinarFormData = z.infer<typeof CreateWebinarSchema>;

// Schema for updating a webinar (often similar to create, but some fields might be handled differently)
// For now, we can make all fields optional for updates, or be more specific.
export const UpdateWebinarSchema = CreateWebinarSchema.partial(); 

export type UpdateWebinarFormData = z.infer<typeof UpdateWebinarSchema>;
