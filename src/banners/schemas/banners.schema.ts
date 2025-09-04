import { z } from 'zod';

export const BannerStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export const CreateBannerSchema = z.object({
  type: z.string().min(1).max(50),
  link: z.string().url().optional(),
  status: BannerStatusSchema.optional().default('ACTIVE'),
  imageId: z.string().optional(),
  imageEnId: z.string().optional(),
});

export const UpdateBannerSchema = z.object({
  type: z.string().min(1).max(50).optional(),
  link: z.string().url().optional(),
  status: BannerStatusSchema.optional(),
  imageId: z.string().nullable().optional(),
  imageEnId: z.string().nullable().optional(),
});

export const UpdateStatusSchema = z.object({
  status: BannerStatusSchema,
});

export const BannerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: BannerStatusSchema.optional(),
});

export type CreateBannerDto = z.infer<typeof CreateBannerSchema>;
export type UpdateBannerDto = z.infer<typeof UpdateBannerSchema>;
export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;
export type BannerQueryDto = z.infer<typeof BannerQuerySchema>;


