import { z } from 'zod';

// Update contact schema
export const UpdateContactSchema = z.object({
  phone: z.string().max(20, 'Phone number must be less than 20 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().max(500, 'Address must be less than 500 characters').optional(),
  addressEn: z.string().max(500, 'English address must be less than 500 characters').optional(),
  businessHours: z.string().max(200, 'Business hours must be less than 200 characters').optional(),
  businessHoursEn: z.string().max(200, 'English business hours must be less than 200 characters').optional(),
  facebookUrl: z.string().url('Invalid Facebook URL format').optional().or(z.literal('')),
  zaloUrl: z.string().url('Invalid Zalo URL format').optional().or(z.literal('')),
  instagramUrl: z.string().url('Invalid Instagram URL format').optional().or(z.literal('')),
  appointmentLink: z.string().url('Invalid appointment link format').optional().or(z.literal('')),
});

// Type exports
export type UpdateContactDto = z.infer<typeof UpdateContactSchema>;
