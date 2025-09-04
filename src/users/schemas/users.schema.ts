import { z } from 'zod';

// User role enum
export const UserRoleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']);

// Create user schema
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: UserRoleSchema.optional().default('EDITOR'),
});

// Update user schema
export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  role: UserRoleSchema.optional(),
});

// Update password schema
export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Reset password schema
export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// User query schema
export const UserQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  role: UserRoleSchema.optional(),
});

// Type exports
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UpdatePasswordDto = z.infer<typeof UpdatePasswordSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type UserQueryDto = z.infer<typeof UserQuerySchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
