import { z } from 'zod';

// Schema for an individual video item when submitting to the API
export const VideoItemSchema = z.object({
  url: z.string().url('Video URL must be a valid URL.'),
  title: z.string().min(1, 'Video title is required.'),
  description: z.string().optional().nullable().default(null), // Default to null if not provided
});
export type VideoItemData = z.infer<typeof VideoItemSchema>;

// Schema for an individual video item within a form (allows empty/optional for initial state)
export const VideoFormItemSchema = z.object({
  id: z.string().optional(), // For existing items during edit
  url: z.string().url('Video URL must be a valid URL.').or(z.literal('')).optional(),
  title: z.string().min(1, 'Video title is required.').or(z.literal('')).optional(),
  description: z.string().optional().nullable(),
});
export type VideoFormItemData = z.infer<typeof VideoFormItemSchema>;

// Schema for creating a new Demo (API payload)
export const DemoCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  coverImage: z.string().url('Invalid URL for cover image').optional().nullable(),
  videos: z.array(VideoItemSchema).optional().default([]),
  priority: z.number().int().optional().nullable(),
  published: z.boolean().optional().default(false),
});
export type DemoCreateData = z.infer<typeof DemoCreateSchema>;

// Schema for updating an existing Demo (API payload)
export const DemoUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional().nullable(),
  coverImage: z.string().url('Invalid URL for cover image').optional().nullable(),
  videos: z.array(VideoItemSchema).optional(), // Videos array is optional, but if provided, must conform
  priority: z.number().int().optional().nullable(),
  published: z.boolean().optional(),
});
export type DemoUpdateData = z.infer<typeof DemoUpdateSchema>;

// Schema for the Create Demo Form (client-side form state)
export const DemoCreateFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  coverImage: z.string().url('Invalid URL for cover image').or(z.literal('')).optional().nullable(),
  videos: z.array(VideoFormItemSchema).optional().default([]),
  priority: z.number().int().optional().nullable(),
  published: z.boolean().optional().default(false),
});
export type DemoCreateFormData = z.infer<typeof DemoCreateFormSchema>;

// Schema for the Edit Demo Form (client-side form state)
export const DemoEditFormSchema = z.object({
  title: z.string().min(1, 'Title is required'), // Title is required even in edit form
  description: z.string().optional().nullable(),
  coverImage: z.string().url('Invalid URL for cover image').or(z.literal('')).optional().nullable(),
  videos: z.array(VideoFormItemSchema).optional().default([]),
  priority: z.number().int().optional().nullable(),
  published: z.boolean().optional(),
});
export type DemoEditFormData = z.infer<typeof DemoEditFormSchema>;
