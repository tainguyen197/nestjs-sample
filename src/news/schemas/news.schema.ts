import { z } from 'zod';

export const CreateNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleEn: z.string().optional(),
  description: z.string().min(1, "Content is required"),
  descriptionEn: z.string().optional().nullable(),
  shortDescription: z.string().min(1, "Short description is required"),
  shortDescriptionEn: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  showOnHomepage: z.boolean().default(false),
  pin: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  categoryEnId: z.string().optional().nullable(),
  slug: z.string().min(1, "Slug is required"),
  featuredImage: z.string().min(1, "Image is required"),
  featureImageId: z.string(),
  featuredImageEn: z.string().optional().nullable(),
  featureImageEnId: z.string().optional().nullable(),
  metaTitle: z.string().max(65, "Meta title must be 65 characters or less").min(1, "Meta title is required"),
  metaTitleEn: z.string().max(65, "Meta title (English) must be 65 characters or less").optional().nullable(),
  metaDescription: z.string().max(155, "Meta description must be 155 characters or less").min(1, "Meta description is required"),
  metaDescriptionEn: z.string().max(155, "Meta description (English) must be 155 characters or less").optional().nullable(),
  metaKeywords: z.string().min(1, "Meta keywords is required"),
  metaKeywordsEn: z.string().optional().nullable(),
});

export const UpdateNewsSchema = CreateNewsSchema.partial();

export const NewsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  status: z.string().optional(),
  pin: z.enum(['true', 'false']).optional(),
});

export const StatusUpdateSchema = z.object({
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
});

export const RelatedNewsQuerySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  currentNewsId: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 3),
  locale: z.string().default('vi'),
});

// Type inference
export type CreateNewsDto = z.infer<typeof CreateNewsSchema>;
export type UpdateNewsDto = z.infer<typeof UpdateNewsSchema>;
export type NewsQueryDto = z.infer<typeof NewsQuerySchema>;
export type StatusUpdateDto = z.infer<typeof StatusUpdateSchema>;
export type RelatedNewsQueryDto = z.infer<typeof RelatedNewsQuerySchema>;
