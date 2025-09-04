import { z } from 'zod';

export const MediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

export const CreateFromUrlSchema = z.object({
  url: z.string().url(),
  fileName: z.string().optional(),
  originalName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().int().optional(),
});

export type MediaQueryDto = z.infer<typeof MediaQuerySchema>;
export type CreateFromUrlDto = z.infer<typeof CreateFromUrlSchema>;


