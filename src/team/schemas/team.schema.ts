import { z } from 'zod';

// Team member status enum
export const TeamMemberStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

// Create team member schema
export const CreateTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  nameEn: z.string().max(100, 'English name must be less than 100 characters').optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  titleEn: z.string().max(100, 'English title must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  descriptionEn: z.string().max(1000, 'English description must be less than 1000 characters').optional(),
  status: TeamMemberStatusSchema.optional().default('ACTIVE'),
  order: z.number().int().min(0).optional().default(0),
  imageId: z.string().optional(),
  imageEnId: z.string().optional(),
});

// Update team member schema
export const UpdateTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  nameEn: z.string().max(100, 'English name must be less than 100 characters').optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  titleEn: z.string().max(100, 'English title must be less than 100 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  descriptionEn: z.string().max(1000, 'English description must be less than 1000 characters').optional(),
  status: TeamMemberStatusSchema.optional(),
  order: z.number().int().min(0).optional(),
  imageId: z.string().optional(),
  imageEnId: z.string().optional(),
});

// Update status schema
export const UpdateStatusSchema = z.object({
  status: TeamMemberStatusSchema,
});

// Update order schema
export const UpdateOrderSchema = z.object({
  order: z.number().int().min(0),
});

// Team member query schema
export const TeamMemberQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: TeamMemberStatusSchema.optional(),
});

// Type exports
export type CreateTeamMemberDto = z.infer<typeof CreateTeamMemberSchema>;
export type UpdateTeamMemberDto = z.infer<typeof UpdateTeamMemberSchema>;
export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;
export type TeamMemberQueryDto = z.infer<typeof TeamMemberQuerySchema>;
