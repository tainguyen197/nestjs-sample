import { z } from 'zod';

// Equipment status enum
export const EquipmentStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

// Create equipment schema
export const CreateEquipmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  nameEn: z.string().max(100, 'English name must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  descriptionEn: z.string().max(1000, 'English description must be less than 1000 characters').optional(),
  status: EquipmentStatusSchema.optional().default('ACTIVE'),
  showOnHomepage: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
  imageId: z.string().optional(),
  imageEnId: z.string().optional(),
});

// Update equipment schema
export const UpdateEquipmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  nameEn: z.string().max(100, 'English name must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters').optional(),
  descriptionEn: z.string().max(1000, 'English description must be less than 1000 characters').optional(),
  status: EquipmentStatusSchema.optional(),
  showOnHomepage: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  imageId: z.string().optional(),
  imageEnId: z.string().optional(),
});

// Update status schema
export const UpdateStatusSchema = z.object({
  status: EquipmentStatusSchema,
});

// Update order schema
export const UpdateOrderSchema = z.object({
  order: z.number().int().min(0, 'Order must be a non-negative integer'),
});

// Reorder schema
export const ReorderSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one equipment ID is required'),
});

// Equipment query schema
export const EquipmentQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: EquipmentStatusSchema.optional(),
  showOnHomepage: z.enum(['true', 'false']).optional(),
});

// Type exports
export type CreateEquipmentDto = z.infer<typeof CreateEquipmentSchema>;
export type UpdateEquipmentDto = z.infer<typeof UpdateEquipmentSchema>;
export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;
export type ReorderDto = z.infer<typeof ReorderSchema>;
export type EquipmentQueryDto = z.infer<typeof EquipmentQuerySchema>;
export type EquipmentStatus = z.infer<typeof EquipmentStatusSchema>;
