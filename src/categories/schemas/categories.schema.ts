import { z } from 'zod';

// Language enum
export const LanguageSchema = z.enum(['vi', 'en']);

// Create category schema
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  language: LanguageSchema.optional().default('vi'),
});

// Update category schema
export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// Category query schema
export const CategoryQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  language: LanguageSchema.optional(),
});

// Get by slug schema
export const GetBySlugSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  language: LanguageSchema.optional().default('vi'),
});

// Get by language schema
export const GetByLanguageSchema = z.object({
  language: LanguageSchema,
});

// Type exports
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type CategoryQueryDto = z.infer<typeof CategoryQuerySchema>;
export type GetBySlugDto = z.infer<typeof GetBySlugSchema>;
export type GetByLanguageDto = z.infer<typeof GetByLanguageSchema>;
export type Language = z.infer<typeof LanguageSchema>;
