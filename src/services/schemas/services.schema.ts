import { z } from 'zod';

// Service status enum
export const ServiceStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);

// Create service schema
export const CreateServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  titleEn: z.string().max(200, 'English title must be less than 200 characters').optional(),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  descriptionEn: z.string().max(5000, 'English description must be less than 5000 characters').optional(),
  shortDescription: z.string().max(500, 'Short description must be less than 500 characters').optional(),
  shortDescriptionEn: z.string().max(500, 'English short description must be less than 500 characters').optional(),
  keywords: z.string().max(200, 'Keywords must be less than 200 characters').optional(),
  enKeywords: z.string().max(200, 'English keywords must be less than 200 characters').optional(),
  status: ServiceStatusSchema.optional().default('DRAFT'),
  showOnHomepage: z.boolean().optional().default(false),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug must be less than 200 characters').optional(),
  featureImageId: z.string().optional(),
  featureImageEnId: z.string().optional(),
  metaTitle: z.string().max(65, 'Meta title must be 65 characters or less').optional(),
  metaTitleEn: z.string().max(65, 'Meta title (English) must be 65 characters or less').optional(),
  metaDescription: z.string().max(155, 'Meta description must be 155 characters or less').optional(),
  metaDescriptionEn: z.string().max(155, 'Meta description (English) must be 155 characters or less').optional(),
  metaKeywords: z.string().max(200, 'Meta keywords must be less than 200 characters').optional(),
  metaKeywordsEn: z.string().max(200, 'Meta keywords (English) must be less than 200 characters').optional(),
});

// Update service schema
export const UpdateServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  titleEn: z.string().max(200, 'English title must be less than 200 characters').optional(),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  descriptionEn: z.string().max(5000, 'English description must be less than 5000 characters').optional(),
  shortDescription: z.string().max(500, 'Short description must be less than 500 characters').optional(),
  shortDescriptionEn: z.string().max(500, 'English short description must be less than 500 characters').optional(),
  keywords: z.string().max(200, 'Keywords must be less than 200 characters').optional(),
  enKeywords: z.string().max(200, 'English keywords must be less than 200 characters').optional(),
  status: ServiceStatusSchema.optional(),
  showOnHomepage: z.boolean().optional(),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug must be less than 200 characters').optional(),
  featureImageId: z.string().optional(),
  featureImageEnId: z.string().optional(),
  metaTitle: z.string().max(65, 'Meta title must be 65 characters or less').optional(),
  metaTitleEn: z.string().max(65, 'Meta title (English) must be 65 characters or less').optional(),
  metaDescription: z.string().max(155, 'Meta description must be 155 characters or less').optional(),
  metaDescriptionEn: z.string().max(155, 'Meta description (English) must be 155 characters or less').optional(),
  metaKeywords: z.string().max(200, 'Meta keywords must be less than 200 characters').optional(),
  metaKeywordsEn: z.string().max(200, 'Meta keywords (English) must be less than 200 characters').optional(),
});

// Update status schema
export const UpdateStatusSchema = z.object({
  status: ServiceStatusSchema,
});

// Service query schema
export const ServiceQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: ServiceStatusSchema.optional(),
  showOnHomepage: z.enum(['true', 'false']).optional(),
});

// Type exports
export type CreateServiceDto = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceDto = z.infer<typeof UpdateServiceSchema>;
export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;
export type ServiceQueryDto = z.infer<typeof ServiceQuerySchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
